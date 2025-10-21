const { InstanceBase, Regex, TCPHelper, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpdateActions = require('./actions.js')
const UpdateFeedbacks = require('./feedbacks.js')
const UpdateVariableDefinitions = require('./variables.js')

const REGEX_IP_OR_HOST =
	'/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})$|^((([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9]))$/'

class BraviaSimpleIPInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)

		this.power = 0
		this.volume = 0
		this.input = ''
		this.mute = 0
		this.picture_mute = 0

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

	init_tcp() {
		if (this.socket) {
			this.socket.destroy()
			delete this.socket
		}

		this.updateStatus(InstanceStatus.Connecting)

		if (this.config.host) {
			this.socket = new TCPHelper(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
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

	async receive(data) {
		const commands = data.toString().split('\n')
		for (let cmd of commands) {
			if (cmd.length > 0) {
				const dataResponse = cmd
				this.log('debug', 'received data: ' + dataResponse)

				// get response type and endpoint
				const resType = dataResponse.substr(2, 1)
				const resEndpoint = dataResponse.substr(3, 4)
				const resParameters = dataResponse.substr(7, 16)
				this.log('debug', 'response type: ' + resType + ' endpoint: ' + resEndpoint + ' parameters: ' + resParameters)

				// check for error response
				if (resType == 'A' && resParameters == 'FFFFFFFFFFFFFFFF') {
					this.log('error', 'Error response received from TV')
				} else if (resType == 'A' && resParameters == '0000000000000000') {
					this.log('info', 'Command processed successfully')
				} else if (resType == 'N') {
					switch (resEndpoint) {
						case 'POWR':
							this.power = parseInt(resParameters)
							this.setVariableValues({ power: this.power })
							break
						case 'VOLU':
							this.volume = parseInt(resParameters)
							this.setVariableValues({ volume: this.volume })
							break
						case 'INPT':
							const inputType = parseInt(resParameters.substr(7, 1))
							const inputNum = parseInt(resParameters.substr(12, 4))
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
							break
						case 'AMUT':
							this.mute = parseInt(resParameters)
							this.setVariableValues({ mute: this.mute })
							break
						case 'PMUT':
							this.picture_mute = parseInt(resParameters)
							this.setVariableValues({ picture_mute: this.picture_mute })
							break
						default:
							this.log('debug', 'No variable mapping for endpoint: ' + resEndpoint)
					}
				}
			}
		}
		this.checkFeedbacks()
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

runEntrypoint(BraviaSimpleIPInstance, [])
