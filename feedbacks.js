const { combineRgb } = require('@companion-module/base')

module.exports = async function (self) {
	self.setFeedbackDefinitions({
		power: {
			type: 'boolean',
			name: 'Power Status',
			description: 'If the TV is On or Off',
			options: [
				{
					type: 'dropdown',
					label: 'Power State',
					id: 'power',
					default: '1',
					choices: [
						{ id: '1', label: 'On' },
						{ id: '0', label: 'Off' },
					],
				},
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback) => {
				if (self.power === undefined) {
					return false
				}
				return self.power.toString() == feedback.options.power
			},
		},
		volume: {
			type: 'boolean',
			name: 'Volume Level',
			description: 'If the Volume is equal to, above or below a certain level',
			options: [
				{
					type: 'dropdown',
					label: 'Volume Comparison',
					id: 'volume_comparison',
					default: 'equal',
					choices: [
						{ id: 'equal', label: 'Equal To' },
						{ id: 'above', label: 'Above' },
						{ id: 'below', label: 'Below' },
					],
				},
				{
					type: 'number',
					label: 'Volume Level',
					id: 'volume_level',
					default: 50,
					min: 0,
					max: 100,
				},
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 165, 0),
			},
			callback: (feedback) => {
				if (self.volume === undefined) {
					return false
				}
				const level = feedback.options.volume_level
				switch (feedback.options.volume_comparison) {
					case 'equal':
						return self.volume === level
					case 'above':
						return self.volume > level
					case 'below':
						return self.volume < level
				}
				return false
			},
		},
		mute: {
			type: 'boolean',
			name: 'Mute Status',
			description: 'If the Audio is Muted or Unmuted',
			options: [
				{
					type: 'dropdown',
					label: 'Mute State',
					id: 'mute_state',
					default: '1',
					choices: [
						{ id: '1', label: 'Muted' },
						{ id: '0', label: 'Unmuted' },
					],
				},
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			callback: (feedback) => {
				if (self.mute === undefined) {
					return false
				}
				return self.mute.toString() == feedback.options.mute_state
			},
		},
		input: {
			type: 'boolean',
			name: 'Input Source',
			description: 'If the Input Source matches the selected source',
			options: [
				{
					type: 'dropdown',
					id: 'input_source',
					label: 'Input Source Type',
					default: 'HDMI',
					choices: [
						{ id: 'HDMI', label: 'HDMI' },
						{ id: 'Composite', label: 'Composite' },
						{ id: 'Component', label: 'Component' },
						{ id: 'Screen Mirroring', label: 'Screen Mirroring' },
					],
				},
				{
					type: 'number',
					id: 'input_number',
					label: 'Input Number (1-9999)',
					min: 1,
					max: 9999,
					default: 1,
					required: true,
				},
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			callback: (feedback) => {
				if (self.input === undefined) {
					return false
				}
				return self.input === feedback.options.input_source + feedback.options.input_number
			},
		},
		picture_mute: {
			type: 'boolean',
			name: 'Picture Mute Status',
			description: 'If the Picture is Muted or Unmuted',
			options: [
				{
					type: 'dropdown',
					label: 'Picture Mute State',
					id: 'picture_mute_state',
					default: '1',
					choices: [
						{ id: '1', label: 'Muted' },
						{ id: '0', label: 'Unmuted' },
					],
				},
			],
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 0, 255),
			},
			callback: (feedback) => {
				if (self.picture_mute === undefined) {
					return false
				}
				return self.picture_mute.toString() == feedback.options.picture_mute_state
			},
		},
	})
}
