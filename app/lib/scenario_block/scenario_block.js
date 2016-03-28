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
 */
Block.setProperty('extend_only', true);

/**
 * This wrapper class starts a new group
 */
Block.setProperty('starts_new_group', true);

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
 */
Block.setMethod(function startEvaluation(callback) {
	this.evaluate(callback);
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
 */
Block.setMethod(function evaluate(callback) {
	console.log('Should evaluate block', this);
});
