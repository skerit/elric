/**
 * The Aggregate Scenario Block:
 * Wait for all links to this block to have happened
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Aggregate = Function.inherits('Elric.ScenarioBlock', function AggregateScenarioBlock(scenario, data) {
	AggregateScenarioBlock.super.call(this, scenario, data);

	// IDS we have already seen
	this.seen_block_ids = [];

	// If it has finished
	this.has_finished = false;
});

/**
 * Aggregate blocks have 2 exits
 *
 * @type {Array}
 */
Aggregate.setProperty('exit_names', ['done', 'timeout']);

/**
 * Set the block schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Aggregate.constitute(function setSchema() {
	// Set an optional timeout
	this.schema.addField('timeout', 'Number');
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
Aggregate.setMethod(function evaluate(from_block, callback) {

	var that = this,
	    entrance_block_ids = this.entrance_block_ids,
	    seen_id,
	    req_id,
	    i,
	    j;

	// Each aggregate block can finish only once
	if (this.has_finished) {
		return;
	}

	if (from_block) {
		this.seen_block_ids.push(String(from_block.id));
	}

	for (i = 0; i < entrance_block_ids.length; i++) {
		req_id = entrance_block_ids[i];

		if (this.seen_block_ids.indexOf(req_id) == -1) {
			return console.log('Not yet seen', req_id, 'so not completing aggregation')
		}
	}

	this.has_finished = true;

	console.log('All blocks have been seen!');

	// Make sure it happens asynchronously
	setImmediate(function doCallback() {
		callback(null, true);
	});
});