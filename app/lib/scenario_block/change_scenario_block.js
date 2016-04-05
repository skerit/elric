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
			result += 'if it has changed since last scenario run.';
		} else {
			result += 'when the value has been seen ' + num_times + ' times.';
		}

		result += ' If not, this block value is set to null but not forwarded.';

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
	    old_result,
	    new_value,
	    num_times,
	    result,
	    id = from_block.id;

	// Get the wanted repeat tiem
	num_times = this.settings.num_times || 0;

	if (!num_times || num_times < 0) {
		num_times = 1;
	}

	// Get the referring block's new value
	new_value = from_block.result_value;

	// Get the referring block's previous result
	old_result = from_block.getPreviousResult();

	if (!num_times || num_times == 1) {

		// If that was null, than it didn't exist, so it changed
		if (old_result.value == null) {
			result = true;
		} else if (Object.alike(old_result.value, new_value)) {
			// If the 2 results are alike, return false
			result = false;
		} else {
			result = true;
		}
	} else {

		if (Object.alike(old_result.value, new_value)) {
			// The values match, now see if the count matches too
			if ((old_result.count + 1) == num_times) {
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

	callback(null, result);

});