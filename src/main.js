const { InstanceBase, Regex, TCPHelper, InstanceStatus } = require('@companion-module/base')
const UpdateActions = require('./actions.js')
const UpdateFeedbacks = require('./feedbacks.js')
const UpdateVariableDefinitions = require('./variables.js')
const UpdatePresets = require('./presets.js')
const UpgradeScripts = require('./upgrades.js')

// endpoints whose state is read back from the TV on connect
const STATE_ENDPOINTS = ['POWR', 'VOLU', 'INPT', 'AMUT', 'PMUT']

const REGEX_IP_OR_HOST =
	'/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})$|^((([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9]))$/'

module.exports = class BraviaSimpleIPInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)

		// unknown until the TV reports them
		this.power = undefined
		this.volume = undefined
		this.input = undefined
		this.mute = undefined
		this.picture_mute = undefined
		this.pendingEnquiries = []
		this.receiveBuffer = ''

		await this.configUpdated(config)
	}

	async configUpdated(config) {
		if (this.socket) {
			this.socket.destroy()
			delete this.socket
		}

		this.config = config

		this.init_tcp()

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updatePresets() // export presets
	}

	async destroy() {
		if (this.socket) {
			this.socket.destroy()
			delete this.socket
		} else {
			this.updateStatus(InstanceStatus.Disconnected)
		}
	}

	clamp(num, min, max) {
		return Math.min(Math.max(num, min), max)
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target Host name or IP',
				width: 8,
				regex: REGEX_IP_OR_HOST,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				default: 20060,
				regex: Regex.PORT,
			},
		]
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}

	updatePresets() {
		UpdatePresets(this)
	}

	init_tcp() {
		if (this.socket) {
			this.socket.destroy()
			delete this.socket
		}

		this.updateStatus(InstanceStatus.Connecting)
		this.pendingEnquiries = []
		this.receiveBuffer = ''

		const host = (this.config.host || '').trim()
		const port = parseInt(this.config.port, 10)

		if (host && Number.isInteger(port) && port >= 1 && port <= 65535) {
			this.socket = new TCPHelper(host, port)

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})

			this.socket.on('connect', () => {
				this.queryState()
			})

			this.socket.on('error', (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				this.log('error', 'Network error: ' + err.message)
			})

			this.socket.on('data', (data) => {
				this.receive(data)
			})
		} else {
			this.updateStatus(InstanceStatus.BadConfig)
		}
	}

	// ask the TV for its current state; answers arrive as 'A' messages
	queryState() {
		for (const endpoint of STATE_ENDPOINTS) {
			this.pendingEnquiries.push(endpoint)
			this.send(`*SE${endpoint}################`)
		}
	}

	receive(data) {
		// messages can be split across TCP reads, so keep the incomplete tail for the next read
		this.receiveBuffer += data.toString('latin1')
		const commands = this.receiveBuffer.split('\n')
		this.receiveBuffer = commands.pop()
		for (let cmd of commands) {
			if (cmd.length > 0) {
				const dataResponse = cmd
				this.log('debug', 'received data: ' + dataResponse)

				// get response type and endpoint
				const resType = dataResponse.substr(2, 1)
				const resEndpoint = dataResponse.substr(3, 4)
				const resParameters = dataResponse.substr(7, 16)
				this.log('debug', 'response type: ' + resType + ' endpoint: ' + resEndpoint + ' parameters: ' + resParameters)

				if (resType == 'A') {
					// answers come back in order, so the first matching pending enquiry is this one
					const enquiryIndex = this.pendingEnquiries.indexOf(resEndpoint)
					const isEnquiryAnswer = enquiryIndex !== -1
					if (isEnquiryAnswer) {
						this.pendingEnquiries.splice(enquiryIndex, 1)
					}

					if (resParameters == 'FFFFFFFFFFFFFFFF') {
						this.log('error', 'Error response received from TV for ' + resEndpoint)
					} else if (resParameters == 'NNNNNNNNNNNNNNNN') {
						this.log('debug', 'TV has no value for ' + resEndpoint)
					} else if (isEnquiryAnswer) {
						this.updateState(resEndpoint, resParameters)
					} else if (resParameters == '0000000000000000') {
						this.log('info', 'Command processed successfully: ' + resEndpoint)
					}
				} else if (resType == 'N') {
					this.updateState(resEndpoint, resParameters)
				}
			}
		}
	}

	updateState(endpoint, parameters) {
		switch (endpoint) {
			case 'POWR':
				this.power = parseInt(parameters)
				this.setVariableValues({ power: this.power, power_text: this.power ? 'On' : 'Off' })
				this.checkFeedbacks('power')
				break
			case 'VOLU':
				this.volume = parseInt(parameters)
				this.setVariableValues({ volume: this.volume })
				this.checkFeedbacks('volume')
				break
			case 'INPT': {
				const inputType = parseInt(parameters.substr(7, 1))
				const inputNum = parseInt(parameters.substr(12, 4))
				// convert type to string
				let inputTypeStr = ''
				switch (inputType) {
					case 1:
						inputTypeStr = 'HDMI'
						break
					case 3:
						inputTypeStr = 'Composite'
						break
					case 4:
						inputTypeStr = 'Component'
						break
					case 5:
						inputTypeStr = 'Screen Mirroring'
						break
				}
				this.input = inputTypeStr + inputNum
				this.setVariableValues({ input: this.input })
				this.checkFeedbacks('input')
				break
			}
			case 'AMUT':
				this.mute = parseInt(parameters)
				this.setVariableValues({ mute: this.mute, mute_text: this.mute ? 'Muted' : 'Unmuted' })
				this.checkFeedbacks('mute')
				break
			case 'PMUT':
				this.picture_mute = parseInt(parameters)
				this.setVariableValues({
					picture_mute: this.picture_mute,
					picture_mute_text: this.picture_mute ? 'Muted' : 'Unmuted',
				})
				this.checkFeedbacks('picture_mute')
				break
			default:
				this.log('debug', 'No variable mapping for endpoint: ' + endpoint)
		}
	}

	async send(cmd) {
		if (cmd != '') {
			/*
			 * create a binary buffer pre-encoded 'latin1' (8bit no change bytes)
			 * sending a string assumes 'utf8' encoding
			 * which then escapes character values over 0x7F
			 * and destroys the 'binary' content
			 */
			const sendBuf = Buffer.from(cmd + '\n', 'latin1')
			this.log('debug', 'sending to ' + this.config.host + ': ' + sendBuf.toString())

			if (this.socket !== undefined && this.socket.isConnected) {
				this.socket.send(sendBuf)
			} else {
				this.log('debug', 'Socket not connected')
			}
		}
	}
}

module.exports.UpgradeScripts = UpgradeScripts
