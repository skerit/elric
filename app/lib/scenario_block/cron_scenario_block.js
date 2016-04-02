/**
 * The Cron Scenario Block:
 * Schedule a cron job for this scenario
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
var Cron = Function.inherits('Elric.ScenarioBlock', function CronScenarioBlock(scenario, data) {
	CronScenarioBlock.super.call(this, scenario, data);
});

/**
 * Cron blocks have no exits and no entries
 *
 * @type {Array}
 */
Cron.setProperty('exit_names', []);

/**
 * Set the block schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Cron.constitute(function setSchema() {
	// Set the cron expression
	this.schema.addField('expression', 'String');
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
Cron.setMethod(function getDescription(callback) {
	callback(null, 'Cron trigger');
});

/**
 * Called when the scenario this block is in is being saved
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {Object}   data      The raw scenario data
 * @param    {Object}   options   The saving options
 * @param    {Boolean}  creating  If this scenario is being created
 */
Cron.setMethod(function savingScenario(data, options, creating) {

	// Add cron to the triggers
	data.triggers.push('cron');

	// Rebuild the cron jobs after a second
	// (because we don't know when the save completes...)
	setTimeout(function() {
		elric.loadCron();
	}, 1000);
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
Cron.setMethod(function evaluate(from_block, callback) {
	callback(null, true);
});