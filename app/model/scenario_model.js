var all_blocks = alchemy.shared('elric.scenario_block');

/**
 * The Scenario Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Scenario = Model.extend(function ScenarioModel(options) {
	ScenarioModel.super.call(this, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Scenario.constitute(function addFields() {

	var block_schema = new alchemy.classes.Schema();

	// Each scenario is created by 1 user
	this.belongsTo('User');

	// The name of the scenario
	this.addField('name', 'String');

	block_schema.addField('id', 'ObjectId', {default: alchemy.ObjectId});
	block_schema.addField('type', 'Enum', {values: all_blocks});
	block_schema.addField('top', 'Number');
	block_schema.addField('left', 'Number');
	block_schema.addField('out_on_true', 'ObjectId', {array: true});
	block_schema.addField('out_on_false', 'ObjectId', {array: true});
	block_schema.addField('settings', 'Object');

	this.addField('blocks', 'Schema', {array: true, schema: block_schema});
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Scenario.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('name');
	list.addField('user_id');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('name');
	edit.addField('user_id');
	edit.addField('blocks');
});

/**
 * Sort blocks
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Scenario.setDocumentMethod(function getSortedBlocks() {

	var result = {},
	    block,
	    data,
	    i;

	if (this.sorted_blocks) {
		return this.sorted_blocks;
	}

	if (!this.blocks) {
		console.log('No blocks found for', this);
		return result;
	}

	for (i = 0; i < this.blocks.length; i++) {
		data = this.blocks[i];

		if (!all_blocks[data.type]) {
			console.error('Could not create block', data.type, data);
			continue;
		}

		block = new all_blocks[data.type](this, data);

		if (block.entrance_point) {
			result.start = block;
		}

		result[block.id] = block;
	}

	this.sorted_blocks = result;

	return result;
});

/**
 * Apply event to this scenario
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Scenario.setDocumentMethod(function applyEvent(event, callback) {

	var blocks = this.getSortedBlocks(),
	    errors,
	    block,
	    end = false;

	if (!blocks.start) {
		return callback(new Error('No starting block was found'));
	}

	// Set the event
	this.event = event;

	// Prepare the errors array
	errors = [];

	// Get the start block
	block = blocks.start;

	this.doBlocks(block, event, function doneAllBlocks(err) {

		if (err) {
			// @todo: do something more with errors
			return callback(err);
		}

		callback(null);
	});
});

/**
 * Do the given blocks (and the blocks they forward to)
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Array}      blocks
 * @param    {Function}   callback
 */
Scenario.setDocumentMethod(function doBlocks(blocks, event, callback) {

	var that = this,
	    tasks = [],
	    i;

	if (typeof event == 'function') {
		callback = event;
		event = null;
	}

	blocks = Array.cast(blocks);

	// Prepare a task for every given block
	blocks.forEach(function eachBlock(block, index) {
		tasks.push(function doBlockTask(next) {

			// Set the event
			block.event = event;

			// Start evaluating this block
			block.startEvaluation(function evaluated(err, value) {

				var next_blocks;

				if (err) {
					return next(err);
				}

				// Get the next blocks to do
				next_blocks = block.getNextBlocks(value);

				if (next_blocks && next_blocks.length) {
					that.doBlocks(next_blocks, event, next);
				} else {
					next();
				}
			});
		});
	});

	// Do the tasks
	Function.parallel(tasks, callback);
});