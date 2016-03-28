var all_actions = alchemy.shared('elric.action');

/**
 * The Action Scenario Block class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Action = Function.inherits('Elric.ScenarioBlock', function ActionScenarioBlock(scenario, data) {
	ActionScenarioBlock.super.call(this, scenario, data);
});

/**
 * Set the block schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Action.constitute(function setSchema() {
	this.schema.addField('action_type', 'Enum', {values: all_actions});
});

/**
 * Evaluate the block with the given data
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Action.setMethod(function evaluate(callback) {

	var that = this,
	    action_type;

	console.log('Evaluate action block', this);

	action_type = this.settings.action_type;

	if (!action_type) {
		return callback(new Error('No action type was defined'));
	}

	elric.doAction(action_type, this.scenario, this.event, function didAction(err, result) {

		console.log('Did action', that);

		callback(err, result);
	});
});