/**
 * The Aggregate Scenario Block:
 * Wait for all links to this block to have happened
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
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