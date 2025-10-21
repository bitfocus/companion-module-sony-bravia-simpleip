const { Regex } = require('@companion-module/base')

// all remote code options
const CHOICES_REMOTE = [
	{ id: '0000000000000005', label: 'Display' },
	{ id: '0000000000000006', label: 'Home' },
	{ id: '0000000000000007', label: 'Options' },
	{ id: '0000000000000008', label: 'Return' },
	{ id: '0000000000000009', label: 'Up' },
	{ id: '0000000000000010', label: 'Down' },
	{ id: '0000000000000011', label: 'Right' },
	{ id: '0000000000000012', label: 'Left' },
	{ id: '0000000000000013', label: 'Confirm' },
	{ id: '0000000000000014', label: 'Red' },
	{ id: '0000000000000015', label: 'Green' },
	{ id: '0000000000000016', label: 'Yellow' },
	{ id: '0000000000000017', label: 'Blue' },
	{ id: '0000000000000018', label: 'Num 1' },
	{ id: '0000000000000019', label: 'Num 2' },
	{ id: '0000000000000020', label: 'Num 3' },
	{ id: '0000000000000021', label: 'Num 4' },
	{ id: '0000000000000022', label: 'Num 5' },
	{ id: '0000000000000023', label: 'Num 6' },
	{ id: '0000000000000024', label: 'Num 7' },
	{ id: '0000000000000025', label: 'Num 8' },
	{ id: '0000000000000026', label: 'Num 9' },
	{ id: '0000000000000027', label: 'Num 0' },
	{ id: '0000000000000030', label: 'Volume +' },
	{ id: '0000000000000031', label: 'Volume -' },
	{ id: '0000000000000032', label: 'Mute' },
	{ id: '0000000000000033', label: 'Channel Up' },
	{ id: '0000000000000034', label: 'Channel Down' },
	{ id: '0000000000000035', label: 'Subtitle' },
	{ id: '0000000000000038', label: 'DOT' },
	{ id: '0000000000000050', label: 'Picture Off' },
	{ id: '0000000000000061', label: 'Wide' },
	{ id: '0000000000000062', label: 'Jump' },
	{ id: '0000000000000076', label: 'Sync Menu' },
	{ id: '0000000000000077', label: 'Forward' },
	{ id: '0000000000000078', label: 'Play' },
	{ id: '0000000000000079', label: 'Rewind' },
	{ id: '0000000000000080', label: 'Prev' },
	{ id: '0000000000000081', label: 'Stop' },
	{ id: '0000000000000082', label: 'Next' },
	{ id: '0000000000000084', label: 'Pause' },
	{ id: '0000000000000086', label: 'Flash Plus' },
	{ id: '0000000000000087', label: 'Flash Minus' },
	{ id: '0000000000000098', label: 'TV Power' },
	{ id: '0000000000000099', label: 'Audio' },
	{ id: '0000000000000101', label: 'Input' },
	{ id: '0000000000000104', label: 'Sleep' },
	{ id: '0000000000000105', label: 'Sleep Timer' },
	{ id: '0000000000000108', label: 'Video 2' },
	{ id: '0000000000000110', label: 'Picture Mode' },
	{ id: '0000000000000121', label: 'Demo Surround' },
	{ id: '0000000000000124', label: 'HDMI 1' },
	{ id: '0000000000000125', label: 'HDMI 2' },
	{ id: '0000000000000126', label: 'HDMI 3' },
	{ id: '0000000000000127', label: 'HDMI 4' },
	{ id: '0000000000000129', label: 'Action Menu' },
	{ id: '0000000000000130', label: 'Help' },
]

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
				const cmd = unescape(action.options.id_send)

				send(cmd)
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
					type: 'textinput',
					id: 'volume_level',
					label: 'Volume Level (0-100)',
					default: '10',
					required: true,
					regex: Regex.NUMBER,
					useVariables: true,
				},
			],
			callback: async (action) => {
				let volume = this.clamp(parseInt(action.options.volume_level), 0, 100)

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
					],
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
				}

				self.send(cmd)
			},
		},
		set_input: {
			name: 'Set Input Source',
			options: [
				{
					type: 'dropdown',
					id: 'input_source',
					label: 'Input Source Type',
					default: '000000010000',
					choices: [
						{ id: '000000010000', label: 'HDMI' },
						{ id: '000000030000', label: 'Composite' },
						{ id: '000000040000', label: 'Component' },
						{ id: '000000050000', label: 'Screen Mirroring' },
					],
				},
				{
					type: 'textinput',
					id: 'input_number',
					label: 'Input Number (1-9999)',
					default: '1',
					required: true,
					regex: Regex.NUMBER,
					useVariables: true,
				},
			],
			callback: async (action) => {
				let cmd = ''
				const inputNum = this.clamp(parseInt(action.options.input_number), 1, 9999)
				const inputNumString = inputNum.toString().padStart(4, '0')
				cmd = `*SCINPT${action.options.input_source}${inputNumString}`

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
					],
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
					choices: CHOICES_REMOTE,
				},
			],
			callback: async (action) => {
				const cmd = `*SCIRCC${action.options.remote_code}`
				self.send(cmd)
			},
		},
	})
}
