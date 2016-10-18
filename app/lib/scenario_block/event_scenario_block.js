var all_events = alchemy.getClassGroup('elric_event');

/**
 * The Event Scenario Block:
 * A conditional block only meant to filter out event types,
 * which also adds a trigger to the scenario it's in
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
var Event = Function.inherits('Elric.ScenarioBlock', function EventScenarioBlock(scenario, data) {
	EventScenarioBlock.super.call(this, scenario, data);
});

/**
 * Set the block schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Event.constitute(function setSchema() {

	// Add the event_type setter
	this.schema.addField('event_type', 'Enum', {values: all_events});

	// The event settings can't be gotten from the its schema,
	// as they pertain to the event itself, they're not really configurations
	// this.schema.addField('event_settings', 'Schema', {schema: 'event_type'});
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
Event.setMethod(function getDescription(callback) {

	// Start with the title 'Sleep'
	var description;

	if (!this.settings.event_type) {
		description = 'Event (none set)';
	} else if (this.exit_block_ids.length) {
		description = 'Check for ' + this.settings.event_type + ' event';
	} else {
		description = 'Trigger scenario on ' + this.settings.event_type + ' event';
	}

	return callback(null, description);
});

/**
 * When the scenario is being saved, add triggers
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {Object}   data      The raw scenario data
 * @param    {Object}   options   The saving options
 * @param    {Boolean}  creating  If this scenario is being created
 */
Event.setMethod(function savingScenario(data, options, creating) {

	// If this event block has a type defined,
	// add it to the scenario triggers
	if (this.settings.event_type) {
		data.triggers.push(this.settings.event_type);
	}
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
Event.setMethod(function evaluate(from_block, callback) {

	var that = this,
	    event_type;

	console.log('Evaluate action block', this, 'coming from', from_block);

	event_type = this.settings.event_type;

	if (!event_type) {
		return callback(new Error('No event type was defined'));
	}

	// If no event is given, it's false
	if (!this.event) {
		callback(null, false);
	}

	// If the event type matches, it's true
	if (this.event.type_name == event_type) {
		callback(null, true);
	} else {
		callback(null, false);
	}
});