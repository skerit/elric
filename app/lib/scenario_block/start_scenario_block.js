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
 * Evaluate the block with the given data
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Start.setMethod(function evaluate(callback) {
	// Start should always evaluate truthy
	callback(null, true);
});
