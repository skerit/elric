/**
 * The Start Scenario Block class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Start = Function.inherits('Elric.ScenarioBlock', function StartScenarioBlock(scenario, data) {
	StartScenarioBlock.super.call(this, scenario, data);
});

/**
 * This is a start block
 *
 * @type {Boolean}
 */
Start.setProperty('entrance_point', true);

/**
 * Start blocks don't have an entrace,
 * they basically ARE entrances
 *
 * @type {Boolean}
 */
Start.setProperty('has_entrance', false);

/**
 * Start blocks have only 1 exit
 *
 * @type {Array}
 */
Start.setProperty('exit_names', ['throughput']);

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
Start.setMethod(function evaluate(from_block, callback) {
	// Start should always evaluate truthy
	callback(null, true);
});
