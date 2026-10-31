const { FixupNumericOrVariablesValueToExpressions } = require('@companion-module/base')

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
]
