/**
 * The Aggregate Scenario Block:
 * Wait for all links to this block to have happened
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
var Sleep = Function.inherits('Elric.ScenarioBlock', function SleepScenarioBlock(scenario, data) {
	SleepScenarioBlock.super.call(this, scenario, data);
});

/**
 * Sleep blocks have only 1 exit, as they can't fail
 *
 * @type {Array}
 */
Sleep.setProperty('exit_names', ['done']);

/**
 * Set the block schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Sleep.constitute(function setSchema() {
	// Set the sleep time
	this.schema.addField('duration', 'Number');
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
Sleep.setMethod(function getDescription(callback) {

	// Start with the title 'Sleep'
	var description = this.title;

	if (this.settings && this.settings.duration != null) {
		description += ' for ' + (this.settings.duration / 1000) + ' seconds';
	} else {
		description += ' (no duration)';
	}

	callback(null, description);
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
Sleep.setMethod(function evaluate(from_block, callback) {

	var that = this,
	    duration;

	if (this.settings.duration) {
		duration = Number(this.settings.duration);
	}

	// If the duration isn't a valid number, sleep for 1 second
	if (typeof duration != 'number' || !isFinite(duration)) {
		duration = 1000;
	}

	setTimeout(function doneSleeping() {
		callback(null, true);
	}, duration);
});