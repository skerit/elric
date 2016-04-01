var all_blocks = alchemy.shared('elric.scenario_block'),
    all_events = alchemy.shared('elric.event');

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

	var that = this;

	ScenarioModel.super.call(this, options);

	// Update triggers when saving
	this.on('saving', function savingRecord(data, options, creating) {

		var document,
		    blocks,
		    block,
		    key,
		    i;

		// Always reset the triggers
		data.triggers = [];

		// Create a scenario document
		document = that.createDocument(data);

		// Get all the blocks
		blocks = document.getSortedBlocks().all;

		for (key in blocks) {
			block = blocks[key];

			// Call doSavingScenario,
			// which (by default) will call savingScenario
			// if the block is not disabled
			block.doSavingScenario(data, options, creating);
		}
	});
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

	// Another schema in the schema
	block_schema.addField('settings', 'Schema', {schema: 'type'});

	// All the blocks of this scenario
	this.addField('blocks', 'Schema', {array: true, schema: block_schema});

	// The events that trigger this scenario
	this.addField('triggers', 'Enum', {array: true, values: {all_events}});
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
 * Get block by its id
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Scenario.setDocumentMethod(function getBlock(id) {

	// Get all blocks
	var blocks = this.getSortedBlocks();

	// Return by its id
	return blocks.all[id];
});

/**
 * Get a block's description
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Scenario.setDocumentMethod(function getBlockDescription(id, callback) {

	var block = this.getBlock(id);

	if (!block) {
		return callback(new Error('Block "' + id + '" not found'));
	}

	block.getDescription(callback);
});

/**
 * Sort blocks
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Scenario.setDocumentMethod(function getSortedBlocks() {

	var result,
	    block,
	    data,
	    i;

	if (this.sorted_blocks) {
		return this.sorted_blocks;
	}

	result = {
		// Start blocks
		start : [],
		// All blocks
		all   : {}
	};

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

		// Create the block instance
		block = new all_blocks[data.type](this, data);

		// Set the block index
		block.index = i;


		// Entrance blocks should be added to the start array
		if (block.entrance_point) {
			result.start.push(block);
		}

		// All blocks should be saved under their ids
		result.all[block.id] = block;
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

	var that = this,
	    blocks = this.getSortedBlocks(),
	    duration,
	    started,
	    errors,
	    block,
	    key,
	    end = false;

	if (!blocks.start.length) {
		return callback(new Error('No starting block was found'));
	}

	// This is the variables object that blocks can use
	if (!this.variables) {
		this.variables = {};
	}

	// Set the event
	this.event = event;

	// Prepare the errors array
	errors = [];

	// Start the timer
	started = Date.now();

	// Start the boot for all the blocks
	for (key in blocks.all) {
		block = blocks.all[key];

		// Start booting the block
		block.startBoot();
	}

	// Evaluate all the blocks, starting with the start block
	this.doBlocks(blocks.start, event, null, function doneAllBlocks(err) {

		duration = Date.now() - started;

		console.log('Scenario', that, 'took', duration, 'ms');

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
Scenario.setDocumentMethod(function doBlocks(blocks, event, from_block, callback) {

	var that = this,
	    tasks = [],
	    i;

	if (typeof event == 'function') {
		callback = event;
		from_block = null;
		event = null;
	}

	if (typeof from_block == 'function') {
		callback = from_block;
		from_block = null;
	}

	blocks = Array.cast(blocks);

	// Prepare a task for every given block
	blocks.forEach(function eachBlock(block, index) {
		tasks.push(function doBlockTask(next) {

			// Set the event
			block.event = event;

			// Start evaluating this block
			block.startEvaluation(from_block, function evaluated(err, value) {

				var next_blocks;

				if (err) {
					return next(err);
				}

				// Get the next blocks to do
				next_blocks = block.getNextBlocks(value);

				if (next_blocks && next_blocks.length) {
					that.doBlocks(next_blocks, event, block, next);
				} else {
					next();
				}
			});
		});
	});

	// Do the tasks
	Function.parallel(tasks, callback);
});