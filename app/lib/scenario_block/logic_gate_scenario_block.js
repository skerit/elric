var change_values = alchemy.shared('elric.block_change_values');

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
		'and'    : 'AND',     // Aggregate and fire truthy
		'or'     : 'OR',      // Wait until first truthy
		'xor'    : 'XOR',     // Only 2 inputs: both have to be different
		'not'    : 'NOT',     // Invert value and fire each
		'nand'   : 'NAND',    // Wait, output false if both inputs are true
		'nor'    : 'NOR',     // Wait, output is true if both inputs are false
		'xnor'   : 'XNOR'    // Wait, output is "true" if both inputs are the same,
	};

	// Set the sleep time
	this.schema.addField('type', 'Enum', {values: gate_types});
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
Gate.setMethod(function getDescription(callback) {

	var type = this.settings.type,
	    count = this.entrance_block_ids.length,
	    result;

	switch (type) {

		case 'and':
			result = 'All ' + count + ' blocks should return true';
			break;

		case 'or':
			result = 'At least 1 of ' + count + ' blocks should return true';
			break;

		case 'xor':
		case 'not':
		case 'nand':
		case 'nor':
		case 'xnor':
			result = 'Type "' + type + '" is not yet implemented';
			break;

		default:
			result = 'Logic gate (not configured)';
			break;
	}

	callback(null, result);
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
Gate.setMethod(function evaluate(from_block, callback, cmd_callback) {

	var that = this,
	    type = this.settings.type;

	if (!type) {
		callback(new Error('Logic gate type not set'));
	}

	this[type + 'Gate'](from_block, callback, cmd_callback);
});

/**
 * AND evaluation
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {ScenarioBlock}   from_block   The referring block
 * @param    {Function}        callback
 * @param    {Function}        cmd_callback
 */
Gate.setMethod(function andGate(from_block, callback, cmd_callback) {

	var that = this,
	    result = true;

	// Wait for all the blocks to callback first
	this.evaluate.super.call(this, from_block, function allCalled(err) {

		var i;

		// Iterate over all the seen blocks
		that.seen_blocks.forEach(function eachBlock(block) {
			result = result && block.result_value;
		});

		callback(null, result);
	}, cmd_callback);
});

/**
 * OR evaluation
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {ScenarioBlock}   from_block   The referring block
 * @param    {Function}        callback
 * @param    {Function}        cmd_callback
 */
Gate.setMethod(function orGate(from_block, callback, cmd_callback) {

	var that = this,
	    result = false;

	// Register this id in the seen block id array
	if (from_block) {
		this.seen_block_ids.push(String(from_block.id));
	}

	// If this gate has already finished, ignore
	if (this.has_finished) {
		return cmd_callback('ignore');
	}

	// If the referring value is truthy, callback now
	if (from_block.result_value) {
		this.has_finished = true;
		return callback(null, true);
	}

	if (!this.seenAll()) {
		return cmd_callback('ignore');
	}

	// Everything has called back, so it's false
	this.has_finished = true;

	setImmediate(function doCallback() {
		callback(null, false);
	});
});