const { combineRgb } = require('@companion-module/base')

const WHITE = combineRgb(255, 255, 255)
const BLACK = combineRgb(0, 0, 0)
const GREEN = combineRgb(0, 200, 0)
const RED = combineRgb(200, 0, 0)

// navigation keys shown in the Navigation section: remote key id and button text
const NAVIGATION_KEYS = [
	{ key: 'up', text: '⬆' },
	{ key: 'down', text: '⬇' },
	{ key: 'left', text: '⬅' },
	{ key: 'right', text: '➡' },
	{ key: 'confirm', text: 'OK' },
	{ key: 'return', text: 'BACK' },
	{ key: 'home', text: 'HOME' },
	{ key: 'options', text: 'OPTIONS' },
	{ key: 'input', text: 'INPUT' },
	{ key: 'display', text: 'DISPLAY' },
]

function style(text, size = '18') {
	return { text, size, color: WHITE, bgcolor: BLACK }
}

function press(actionId, options) {
	return [{ down: [{ actionId, options }], up: [] }]
}

module.exports = function (self) {
	const label = self.label

	const presets = {
		power_on: {
			type: 'simple',
			name: 'Power On',
			style: style('POWER\\nON'),
			steps: press('set_power_status', { power_status: 'on' }),
			feedbacks: [{ feedbackId: 'power', options: { power: '1' }, style: { bgcolor: GREEN } }],
		},
		power_off: {
			type: 'simple',
			name: 'Power Off',
			style: style('POWER\\nOFF'),
			steps: press('set_power_status', { power_status: 'off' }),
			feedbacks: [{ feedbackId: 'power', options: { power: '0' }, style: { bgcolor: RED } }],
		},
		power_toggle: {
			type: 'simple',
			name: 'Power Toggle',
			style: style(`POWER\\n$(${label}:power_text)`),
			steps: press('set_power_status', { power_status: 'toggle' }),
			feedbacks: [{ feedbackId: 'power', options: { power: '1' }, style: { bgcolor: GREEN } }],
		},

		volume_up: {
			type: 'simple',
			name: 'Volume Up',
			style: style('VOL +', '24'),
			steps: press('remote_control', { remote_code: 'volume_up' }),
			feedbacks: [],
		},
		volume_down: {
			type: 'simple',
			name: 'Volume Down',
			style: style('VOL -', '24'),
			steps: press('remote_control', { remote_code: 'volume_down' }),
			feedbacks: [],
		},
		volume_level: {
			type: 'simple',
			name: 'Volume Level',
			style: style(`VOL\\n$(${label}:volume)`),
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		},
		mute_toggle: {
			type: 'simple',
			name: 'Mute Toggle',
			style: style(`MUTE\\n$(${label}:mute_text)`, '14'),
			steps: press('set_mute', { mute_state: 'toggle' }),
			feedbacks: [{ feedbackId: 'mute', options: { mute_state: '1' }, style: { bgcolor: RED } }],
		},

		input_hdmi: {
			type: 'simple',
			name: 'HDMI Input',
			style: style('HDMI\\n$(local:input)'),
			localVariables: [{ variableType: 'simple', variableName: 'input', startupValue: 1 }],
			steps: press('set_input', {
				input_source: 'HDMI',
				input_number: { isExpression: true, value: '$(local:input)' },
			}),
			feedbacks: [
				{
					feedbackId: 'input',
					options: { input_source: 'HDMI', input_number: { isExpression: true, value: '$(local:input)' } },
					style: { bgcolor: GREEN },
				},
			],
		},

		picture_mute_toggle: {
			type: 'simple',
			name: 'Picture Mute Toggle',
			style: style(`PICTURE\\n$(${label}:picture_mute_text)`, '14'),
			steps: press('set_picture_mute', { picture_mute_state: 'toggle' }),
			feedbacks: [{ feedbackId: 'picture_mute', options: { picture_mute_state: '1' }, style: { bgcolor: RED } }],
		},
		picture_mute_on: {
			type: 'simple',
			name: 'Picture Mute On',
			style: style('PICTURE\\nOFF', '14'),
			steps: press('set_picture_mute', { picture_mute_state: 'on' }),
			feedbacks: [{ feedbackId: 'picture_mute', options: { picture_mute_state: '1' }, style: { bgcolor: RED } }],
		},
		picture_mute_off: {
			type: 'simple',
			name: 'Picture Mute Off',
			style: style('PICTURE\\nON', '14'),
			steps: press('set_picture_mute', { picture_mute_state: 'off' }),
			feedbacks: [{ feedbackId: 'picture_mute', options: { picture_mute_state: '0' }, style: { bgcolor: GREEN } }],
		},
	}

	for (const { key, text } of NAVIGATION_KEYS) {
		presets[`nav_${key}`] = {
			type: 'simple',
			name: `Navigation ${text}`,
			style: style(text, text.length > 4 ? '14' : '24'),
			steps: press('remote_control', { remote_code: key }),
			feedbacks: [],
		}
	}

	const structure = [
		{
			id: 'power',
			name: 'Power',
			definitions: ['power_on', 'power_off', 'power_toggle'],
		},
		{
			id: 'audio',
			name: 'Audio',
			definitions: ['volume_up', 'volume_down', 'volume_level', 'mute_toggle'],
		},
		{
			id: 'inputs',
			name: 'Inputs',
			definitions: [
				{
					id: 'inputs_hdmi',
					type: 'template',
					name: 'HDMI inputs',
					presetId: 'input_hdmi',
					templateVariableName: 'input',
					templateValues: [1, 2, 3, 4].map((input) => ({ name: `HDMI ${input}`, value: input })),
				},
			],
		},
		{
			id: 'picture',
			name: 'Picture',
			definitions: ['picture_mute_toggle', 'picture_mute_on', 'picture_mute_off'],
		},
		{
			id: 'navigation',
			name: 'Navigation',
			definitions: NAVIGATION_KEYS.map(({ key }) => `nav_${key}`),
		},
	]

	self.setPresetDefinitions(structure, presets)
}
