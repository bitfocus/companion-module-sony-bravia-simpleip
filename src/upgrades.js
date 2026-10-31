const { FixupNumericOrVariablesValueToExpressions } = require('@companion-module/base')
const { REMOTE_KEYS, INPUT_TYPES } = require('./constants.js')

// replace a saved protocol code with its readable id; expressions are left alone
function codeToId(value, list) {
	if (!value || value.isExpression) return value
	const entry = list.find((item) => item.code === value.value)
	return entry ? { isExpression: false, value: entry.id } : value
}

module.exports = [
	/*
	 * Place your upgrade scripts here
	 * Remember that once it has been added it cannot be removed!
	 */

	// v1.2.0 changed volume_level and input_number from textinput to number,
	// so actions saved by v1.1.0 and earlier still hold string values
	function (_context, props) {
		const result = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		for (const action of props.actions) {
			if (action.actionId === 'set_volume') {
				action.options.volume_level = FixupNumericOrVariablesValueToExpressions(action.options.volume_level)
				result.updatedActions.push(action)
			} else if (action.actionId === 'set_input') {
				action.options.input_number = FixupNumericOrVariablesValueToExpressions(action.options.input_number)
				result.updatedActions.push(action)
			}
		}

		return result
	},

	// dropdown ids for remote keys and input types changed from raw protocol codes to readable ids
	function (_context, props) {
		const result = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		for (const action of props.actions) {
			if (action.actionId === 'remote_control') {
				action.options.remote_code = codeToId(action.options.remote_code, REMOTE_KEYS)
				result.updatedActions.push(action)
			} else if (action.actionId === 'set_input') {
				action.options.input_source = codeToId(action.options.input_source, INPUT_TYPES)
				result.updatedActions.push(action)
			}
		}

		return result
	},
]
