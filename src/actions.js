const { REMOTE_KEYS, INPUT_TYPES } = require('./constants.js')

module.exports = function (self) {
	self.setActionDefinitions({
		send: {
			name: 'Send Command',
			options: [
				{
					type: 'textinput',
					id: 'id_send',
					label: 'Command:',
					tooltip: `Include the starting *S, but not the ending newline. Example: *SCPOWR0000000000000001`,
					default: '',
					useVariables: true,
				},
			],
			callback: async (action) => {
				const cmd = action.options.id_send
				self.send(cmd)
			},
		},
		set_power_status: {
			name: 'Set Power Status',
			options: [
				{
					type: 'dropdown',
					id: 'power_status',
					label: 'Power Status',
					default: 'on',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: async (action) => {
				let cmd = ''
				switch (action.options.power_status) {
					case 'on':
						cmd = '*SCPOWR0000000000000001'
						break
					case 'off':
						cmd = '*SCPOWR0000000000000000'
						break
					case 'toggle':
						cmd = '*SCTPOW################'
						break
				}

				self.send(cmd)
			},
		},
		set_volume: {
			name: 'Set Volume Level',
			options: [
				{
					type: 'number',
					id: 'volume_level',
					label: 'Volume Level (0-100)',
					default: 10,
					min: 0,
					max: 100,
					asInteger: true,
					clampValues: true,
				},
			],
			callback: async (action) => {
				const volume = self.clamp(Math.round(Number(action.options.volume_level)), 0, 100)
				if (Number.isNaN(volume)) {
					self.log('warn', 'Invalid volume level: ' + action.options.volume_level)
					return
				}

				const volumeString = volume.toString().padStart(16, '0')
				const cmd = `*SCVOLU${volumeString}`

				self.send(cmd)
			},
		},
		set_mute: {
			name: 'Set Mute State',
			options: [
				{
					type: 'dropdown',
					id: 'mute_state',
					label: 'Mute State',
					default: 'off',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
						{ id: 'toggle', label: 'Toggle' },
					],
					disableAutoExpression: true,
				},
			],
			callback: async (action) => {
				let cmd = ''
				switch (action.options.mute_state) {
					case 'on':
						cmd = '*SCAMUT0000000000000001'
						break
					case 'off':
						cmd = '*SCAMUT0000000000000000'
						break
					case 'toggle':
						// Simple IP has no mute toggle; fall back to the remote's Mute key while the state is unknown
						if (self.mute === undefined) {
							cmd = '*SCIRCC0000000000000032'
						} else {
							cmd = self.mute ? '*SCAMUT0000000000000000' : '*SCAMUT0000000000000001'
						}
						break
				}

				// assume the TV took it, so a quick second toggle flips back; the re-read corrects any mismatch
				if (self.send(cmd) && cmd.startsWith('*SCAMUT')) {
					self.updateState('AMUT', cmd.substr(7))
				}
			},
		},
		set_input: {
			name: 'Set Input Source',
			options: [
				{
					type: 'dropdown',
					id: 'input_source',
					label: 'Input Source Type',
					default: 'HDMI',
					choices: INPUT_TYPES.map(({ id, label }) => ({ id, label })),
					expressionDescription: 'One of: ' + INPUT_TYPES.map(({ id }) => id).join(', '),
				},
				{
					type: 'number',
					id: 'input_number',
					label: 'Input Number (1-9999)',
					default: 1,
					min: 1,
					max: 9999,
					asInteger: true,
					clampValues: true,
				},
			],
			callback: async (action) => {
				let cmd = ''
				const inputNum = self.clamp(Math.round(Number(action.options.input_number)), 1, 9999)
				if (Number.isNaN(inputNum)) {
					self.log('warn', 'Invalid input number: ' + action.options.input_number)
					return
				}
				// raw codes still work, for expressions written before ids were readable
				const inputType = INPUT_TYPES.find(
					(type) => type.id === action.options.input_source || type.code === action.options.input_source,
				)
				if (!inputType) {
					self.log('warn', 'Invalid input source: ' + action.options.input_source)
					return
				}
				const inputNumString = inputNum.toString().padStart(4, '0')
				cmd = `*SCINPT${inputType.code}${inputNumString}`

				self.send(cmd)
			},
		},
		set_picture_mute: {
			name: 'Set Picture Mute State',
			options: [
				{
					type: 'dropdown',
					id: 'picture_mute_state',
					label: 'Picture Mute State',
					default: 'off',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
						{ id: 'toggle', label: 'Toggle' },
					],
					disableAutoExpression: true,
				},
			],
			callback: async (action) => {
				let cmd = ''
				switch (action.options.picture_mute_state) {
					case 'on':
						cmd = '*SCPMUT0000000000000001'
						break
					case 'off':
						cmd = '*SCPMUT0000000000000000'
						break
					case 'toggle':
						cmd = '*SCTPMU################'
						break
				}

				self.send(cmd)
			},
		},
		remote_control: {
			name: 'Press Key',
			options: [
				{
					type: 'dropdown',
					id: 'remote_code',
					label: 'Button',
					default: 'home',
					choices: REMOTE_KEYS.map(({ id, label }) => ({ id, label })),
					expressionDescription: 'A key id such as home, up, confirm, volume_up or hdmi1',
				},
			],
			callback: async (action) => {
				// raw codes still work, for expressions written before ids were readable
				const key = REMOTE_KEYS.find(
					(remoteKey) => remoteKey.id === action.options.remote_code || remoteKey.code === action.options.remote_code,
				)
				if (!key) {
					self.log('warn', 'Invalid remote key: ' + action.options.remote_code)
					return
				}
				const cmd = `*SCIRCC${key.code}`
				self.send(cmd)
			},
		},
	})
}
