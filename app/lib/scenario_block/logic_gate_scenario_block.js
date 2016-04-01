/**
 * The Logic Gate Scenario Block:
 * Apply OR/AND/...
 * http://whatis.techtarget.com/definition/logic-gate-AND-OR-XOR-NOT-NAND-NOR-and-XNOR
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
var Gate = Function.inherits('Elric.AggregateScenarioBlock', function LogicGateScenarioBlock(scenario, data) {
	LogicGateScenarioBlock.super.call(this, scenario, data);
});

/**
 * Sleep blocks have only 1 exit, as they can't fail
 *
 * @type {Array}
 */
Gate.setProperty('exit_names', ['true', 'false']);

/**
 * Set the block schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Gate.constitute(function setSchema() {

	var gate_types = {
		'and'  : 'AND',  // Aggregate and fire truthy
		'or'   : 'OR',   // Wait until first truthy
		'xor'  : 'XOR',  // Only 2 inputs: both have to be different
		'not'  : 'NOT',  // Invert value and fire each
		'nand' : 'NAND', // Wait, output false if both inputs are true
		'nor'  : 'NOR',  // Wait, output is true if both inputs are false
		'xnor' : 'XNOR'  // Wait, output is "true" if both inputs are the same
	};

	// Set the sleep time
	this.schema.addField('type', 'Enum', {values: gate_types});
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
Gate.setMethod(function evaluate(from_block, callback) {

	var that = this;

	console.log('Gate block:', this, 'coming from:', from_block);
});