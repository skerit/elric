var old_values = elric.persistedShare('change_block_previous_values');

/**
 * The CHANGE Scenario Block:
 * True if the value of the referring block has changed
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
var Change = Function.inherits('Elric.ScenarioBlock', function ChangeScenarioBlock(scenario, data) {
	ChangeScenarioBlock.super.call(this, scenario, data);

	// The input block old values will be stored in here on boot
	this.old_input_values = {};
});

/**
 * Change blocks have no settings
 *
 * @type {Boolean}
 */
Change.setProperty('has_settings', false);

/**
 * Set the block schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Change.constitute(function setSchema() {

});

/**
 * Bootup the block,
 * get the input blocks previous value
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {Function}        callback
 */
Change.setMethod(function boot(callback) {

	var that = this,
	    old_value,
	    blocks,
	    block,
	    i;

	blocks = this.getEntranceBlocks();

	// Iterate over all the blocks and get their old values
	for (i = 0; i < blocks.length; i++) {
		block = blocks[i];

		// See if this block has a previous value
		old_value = old_values[block.id];

		// Store it
		this.old_input_values[block.id] = old_value;
	}

	callback(null);
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
Change.setMethod(function getDescription(callback) {

	var count = this.entrance_block_ids.length,
	    result;

	result = 'Return true if the previous block has changed value';

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
Change.setMethod(function evaluate(from_block, callback, cmd_callback) {

	var that = this,
	    old_value,
	    new_value,
	    result;

	// Get the referring block's new value
	new_value = from_block.result_value;

	// Save the new value for next runs
	old_values[from_block.id] = new_value;

	// Get the old value, the value before this run
	old_value = this.old_input_values[from_block.id];

	// If that was null, than it didn't exist, so it changed
	if (old_value == null) {
		result = true;
	} else if (Object.alike(old_value, new_value)) {
		// If the 2 results are alike, return false
		result = false;
	} else {
		result = true;
	}

	callback(null, result);
});