/**
 * The Forward Scenario Block:
 * Forward values as they are
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
var Forward = Function.inherits('Elric.ScenarioBlock', function ForwardScenarioBlock(scenario, data) {
	ForwardScenarioBlock.super.call(this, scenario, data);
});

/**
 * Change blocks have no settings
 *
 * @type {Boolean}
 */
Forward.setProperty('has_settings', false);

/**
 * Static description,
 * only set when this block should never use
 * `getDescription`
 *
 * @type {Boolean}
 */
Forward.setProperty('static_description', 'Simply forward input value');

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
Forward.setMethod(function evaluate(from_block, callback, cmd_callback) {
	return callback(null, from_block.result_value);
});