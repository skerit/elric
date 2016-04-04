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
	// The same value needs to pass n times before firing
	this.schema.addField('num_times', 'Number', {default: 0});

	// Forward the value (only works with repeat)
	this.schema.addField('forward_value', 'Boolean', {default: false});
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
		this.old_input_values[block.id] = Object.assign({}, old_value);
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
	    result,
	    num_times;

	num_times = this.settings.num_times || 0;

	if (!num_times || num_times < 0) {
		num_times = 1;
	}

	if (this.settings.forward_value) {
		result = 'Return previous block value ';

		if (num_times == 1) {
			result += 'if it has changed since last scenario run';
		} else {
			result += 'when the value has been seen ' + num_times + ' times';
		}
	} else {
		result = 'Return true if previous block ';

		if (num_times == 1) {
			result += 'has changed value';
		} else {
			result += 'value has been seen ' + num_times + ' times';
		}
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
Change.setMethod(function evaluate(from_block, callback, cmd_callback) {

	var that = this,
	    was_not_updated,
	    overwrite_value,
	    do_increment,
	    old_value,
	    new_value,
	    num_times,
	    result,
	    entry,
	    count,
	    id = from_block.id;

	// Get the wanted repeat tiem
	num_times = this.settings.num_times || 0;

	if (!num_times || num_times < 0) {
		num_times = 1;
	}

	// Get the referring block's new value
	new_value = from_block.result_value;

	// Make sure the old_values entry exists for this id
	if (!old_values[id]) {
		old_values[id] = {

			// The current value this block is reporting
			value: null,

			// The amount of times this value has been seen
			count: 0
		};
	}

	// Get the entry
	entry = old_values[id];

	// Update the block with the new value for next runs,
	// if we haven't done so before
	if (!from_block.updated_result_value) {
		was_not_updated = true;

		// If the value has changed, store it for later runs
		if (entry.value == null || !Object.alike(entry.value, new_value)) {
			entry.value = new_value;
			entry.count = 0;
		} else {
			// The values are the same, so increase the count
			entry.count++;
		}
	}

	// Indicate the result of the block has already been taken into account
	from_block.updated_result_value = true;

	// Get the old value entry, the values before this scenario run
	old_value = this.old_input_values[id] || {};

	if (!num_times || num_times == 1) {

		// If that was null, than it didn't exist, so it changed
		if (old_value.value == null) {
			result = true;
		} else if (Object.alike(old_value.value, new_value)) {
			// If the 2 results are alike, return false
			result = false;
		} else {
			result = true;
		}
	} else {
		// console.log('REPEAT is:', num_times);
		// console.log('VALUES:', old_value, new_value);

		if (Object.alike(old_value.value, new_value)) {
			// The values match, now see if the count matches too
			if (old_value.count == num_times) {
				result = true;
			} else {
				result = false;
			}
		} else {
			result = false;
		}
	}

	// See if we have to forward the previous block's value
	if (this.settings.forward_value) {
		if (result) {
			result = new_value;
		} else {
			// We have to forward the previous value, but it hasn't changed,
			// so forward nothing
			return cmd_callback('ignore');
		}
	}

	console.log('RESULT change:', result);

	callback(null, result);
});