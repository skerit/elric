var all_actions = alchemy.getClassGroup('elric_action');

/**
 * The Action Scenario Block class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {ScenarioDocument}   scenario    The scenario this block is in
 * @param    {Object}             data        Scenario-specific block data
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

	// Add the action_type setter
	this.schema.addField('action_type', 'Enum', {values: all_actions});

	// Add the settings subschema
	this.schema.addField('action_settings', 'Schema', {schema: 'action_type'});
});

/**
 * Callback with a nice description to display in the scenario editor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {Function}   callback
 */
Action.setMethod(function getDescription(callback) {

	// Start with the title 'Sleep'
	var constructor,
	    description,
	    document,
	    action;

	console.log('Action block:', this)

	if (!this.settings.action_type) {
		return callback(null, 'Action (none set)');
	}

	constructor = all_actions[this.settings.action_type];

	if (!constructor) {
		return callback(null, 'Unknown "' + this.settings.action_type + '" action');
	}

	// Create a dummy action document
	document = Model.get('Action').createDocument();

	// Set the action type
	document.type = this.settings.action_type;

	// Create & initialize the action
	action = new constructor(document);

	if (this.settings.action_settings) {
		action.setPayload(this.settings.action_settings);
	}

	action.getDescription(callback);
});

/**
 * Evaluate the block with the given data
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {ScenarioBlock}   from_block   The referring block
 * @param    {Function}        callback
 */
Action.setMethod(function evaluate(from_block, callback) {

	var that = this,
	    action_type,
	    action_settings;

	// Get the action type
	action_type = this.settings.action_type;

	if (!action_type) {
		return callback(new Error('No action type was defined'));
	}

	// Get the action settings
	action_settings = this.settings.action_settings;

	elric.doAction(action_type, this.scenario, this.event, action_settings, function didAction(err, result) {
		callback(err, result);
	});
});