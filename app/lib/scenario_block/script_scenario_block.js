/**
 * The Script Scenario Block class
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
var Script = Function.inherits('Elric.ScenarioBlock', function ScriptScenarioBlock(scenario, data) {
	ScriptScenarioBlock.super.call(this, scenario, data);
});

/**
 * Static description,
 * only set when this block should never use
 * `getDescription`
 *
 * @type {Boolean}
 */
Script.setProperty('static_description', 'Evaluate JavaScript');

/**
 * Set the block schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Script.constitute(function setSchema() {
	this.schema.addField('source', 'String');
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
Script.setMethod(function evaluate(from_block, callback) {

	var that = this,
	    fnc;

	if (!this.settings.source) {
		return callback(null, false);
	}

	console.log('Evaluate script block', this, 'coming from', from_block);

	fnc = new Function('callback', this.settings.source);

	fnc.call(this, callback);
});