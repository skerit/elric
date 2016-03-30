/**
 * The Base Scenario Block class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {ScenarioDocument}   scenario_document
 * @param    {Object}             block_data
 */
var Block = Function.inherits('Elric.Wrapper', function ScenarioBlock(scenario_document, block_data) {

	if (!scenario_document) {
		throw new Error('Scenario blocks require a scenario document');
	}

	// Store the scenario
	this.scenario = scenario_document;

	// And the block data
	this.data = block_data || {};

	// And the configuration
	this.settings = this.data.settings || {};

	// Store the id
	this.id = this.data.id;
});

/**
 * This is a wrapper class
 *
 * @type {Boolean}
 */
Block.setProperty('extend_only', true);

/**
 * This wrapper class starts a new group
 *
 * @type {Boolean}
 */
Block.setProperty('starts_new_group', true);

/**
 * Only start blocks are entrance points
 *
 * @type {Boolean}
 */
Block.setProperty('entrance_point', false);

/**
 * Each block has a run counter
 *
 * @type {Number}
 */
Block.setProperty('evaluation_count', 0);

/**
 * Most blocks have an entrance
 * (So other blocks can point towards it)
 *
 * @type {Boolean}
 */
Block.setProperty('has_entrance', true);

/**
 * Most blocks have 2 exits
 *
 * @type {Array}
 */
Block.setProperty('exit_names', ['true', 'false']);


/**
 * Return the class-wide schema
 *
 * @type   {Schema}
 */
Block.setProperty(function schema() {
	return this.constructor.schema;
});

/**
 * Return the truthy output block ids
 *
 * @type   {Schema}
 */
Block.setProperty(function block_ids_when_true() {

	var result = [],
	    id,
	    i;

	if (this.data && this.data.out_on_true && this.data.out_on_true.length) {
		for (i = 0; i < this.data.out_on_true.length; i++) {
			id = this.data.out_on_true[i];

			if (id) {
				result.push(id);
			}
		}
	}

	return result;
});

/**
 * Return the falsy output block ids
 *
 * @type   {Schema}
 */
Block.setProperty(function block_ids_when_false() {

	var result = [],
	    id,
	    i;

	if (this.data && this.data.out_on_false && this.data.out_on_false.length) {
		for (i = 0; i < this.data.out_on_false.length; i++) {
			id = this.data.out_on_false[i];

			if (id) {
				result.push(id);
			}
		}
	}

	return result;
});

/**
 * Get the blocks pointing to this
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Block.setProperty(function entrance_block_ids() {

	var scenario_blocks,
	    exit_ids,
	    block_ids,
	    result = [],
	    block,
	    exit_id,
	    temp,
	    id,
	    i;

	if (this._entrance_block_ids) {
		return this._entrance_block_ids;
	}

	// Get all the available scenario blocks 
	scenario_blocks = this.scenario.getSortedBlocks();

	for (id in scenario_blocks) {
		block = scenario_blocks[id];

		// Get all the exit ids
		exit_ids = block.block_ids_when_true.concat(block.block_ids_when_false);

		for (i = 0; i < exit_ids.length; i++) {

			// Ignore falsy values
			if (!exit_ids[i]) {
				continue;
			}

			// Stringify the id
			exit_id = String(exit_ids[i]);

			// Compare to the id of this block
			if (exit_id == this.id) {
				// The ids match, so the block itself points here
				temp = String(block.id);

				// Make sure each id only gets added once
				if (result.indexOf(temp) == -1) {
					result.push(temp);
				}
			}
		}
	}

	this._entrance_block_ids = result;

	return result;
});

/**
 * Set the block schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Block.constitute(function setSchema() {

	var schema;

	// Create a new schema
	schema = new alchemy.classes.Schema(this);
	this.schema = schema;
});

/**
 * This method starts the evaluation
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {ScenarioBlock}   from_block   The referring block
 * @param    {Function}        callback
 */
Block.setMethod(function startEvaluation(from_block, callback) {

	// Increase the evaluation counter
	this.evaluation_count++;

	// Do the actual evaluating
	this.evaluate(from_block, callback);
});

/**
 * Get the blocks pointing to this
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Block.setMethod(function getEntranceBlocks() {

	var entrance_block_ids = this.entrance_block_ids,
	    scenario_blocks,
	    result = [],
	    block,
	    id,
	    i;

	if (this._entrance_blocks) {
		return this._entrance_blocks;
	}

	scenario_blocks = this.scenario.getSortedBlocks();

	for (i = 0; i < entrance_block_ids.length; i++) {
		id = entrance_block_ids[i];
		block = scenario_blocks[id];

		if (block) {
			result.push(block);
		}
	}

	this._entrance_blocks = result;
	return result;
});

/**
 * Get the next blocks, depending on response value
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Block.setMethod(function getNextBlocks(value) {

	var scenario_blocks,
	    block_ids,
	    result = [],
	    block,
	    id,
	    i;

	if (value) {
		block_ids = this.block_ids_when_true;
	} else {
		block_ids = this.block_ids_when_false;
	}

	if (block_ids && block_ids.length) {
		// Get all the blocks in the scenario
		scenario_blocks = this.scenario.getSortedBlocks();

		for (i = 0; i < block_ids.length; i++) {
			id = block_ids[i];

			block = scenario_blocks[id];

			if (block) {
				result.push(block);
			}
		}
	}

	return result;
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
Block.setMethod(function evaluate(from_block, callback) {
	console.log('Should evaluate block', this);
});
