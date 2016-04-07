var all_blocks = alchemy.shared('elric.scenario_block'),
    all_events = alchemy.shared('elric.event'),
    persisted  = elric.persistedShare('scenario_block_values');

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

	// Is this scenario enabled?
	this.addField('enabled', 'Boolean', {default: false});
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
	list.addField('enabled');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('name');
	edit.addField('user_id');
	edit.addField('enabled');
	edit.addField('blocks');
});

/**
 * Set default scenario scope name
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Scenario.setDocumentProperty('scope_name', 'default');

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

	if (!callback) {
		callback = Function.thrower;
	}

	if (!blocks.start.length) {
		return callback(new Error('No starting block was found'));
	}

	if (this._has_already_started) {
		return callback(new Error("Can't start the same scenario document twice!"));
	}

	this._has_already_started = true;

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

	// Get a clone of the current persisted values
	this.previous_result_clone = JSON.clone(this.getPersistedValues());

	// Start the boot for all the blocks
	for (key in blocks.all) {
		block = blocks.all[key];

		// Start booting the block
		block.startBoot();
	}

	// Evaluate all the blocks, starting with the start block
	this.doBlocks(blocks.start, event, null, function doneAllBlocks(err) {

		duration = Date.now() - started;

		//console.log('Scenario', that, 'took', duration, 'ms');

		if (err) {
			// @todo: do something more with errors
			return callback(err);
		}

		callback(null);
	});
});

/**
 * Get the persisted entries for this scenario
 * as they are now
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @return   {Object}
 */
Scenario.setDocumentMethod(function getPersistedValues() {

	// Ensure the entry for this scenario exists
	if (!persisted[this._id]) {
		persisted[this._id] = {};
	}

	return persisted[this._id];
});

/**
 * Get the persisted scope values as they are now
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @return   {Object}
 */
Scenario.setDocumentMethod(function getScopeValues(scope_name) {

	var values = this.getPersistedValues();

	if (!scope_name) {
		scope_name = this.scope_name;
	}

	if (!values[scope_name]) {
		values[scope_name] = {};
	}

	return values[scope_name];
});

/**
 * Touch the block entry in the persisted value and return it
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Block}      block
 */
Scenario.setDocumentMethod(function touchPersistedBlockValue(block, scope_name, new_object) {

	var scope_values,
	    block_value,
	    donew;

	if (!block) {
		return false;
	}

	// If no scope name is given,
	// see if the second argument is actually the new_object
	if (scope_name && typeof scope_name == 'object') {
		new_object = scope_name;
		scope_name = null;
	}

	scope_values = this.getScopeValues(scope_name);

	if (new_object) {
		scope_values[block.id] = new_object;

		// Add the updated time
		new_object.updated = Date.now();
	} else if (!scope_values[block.id]) {
		scope_values[block.id] = {};
	}

	block_value = scope_values[block.id];

	return block_value;
});

/**
 * Persist the value of the given block
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Block}      block
 */
Scenario.setDocumentMethod(function persistBlockValue(block) {

	var block_value,
	    new_value,
	    donew;

	if (!block) {
		return false;
	}

	new_value = block.result_value;

	// Get the block value object
	block_value = this.touchPersistedBlockValue(block);

	if (block_value.count == null) {
		donew = true;
	} else if (!Object.alike(block_value.value, new_value)) {
		donew = true;
	}

	if (donew) {
		block_value = {
			value: new_value,
			count: 1
		};
	} else {
		// Increase the counter
		block_value.count++;
	}

	// Overwrite the block value
	this.touchPersistedBlockValue(block, block_value);

	return true;
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

			var ignored;

			// Make sure next gets called only once
			next = Function.regulate(next, 1);

			// Set the event
			block.event = event;

			// Start evaluating this block
			block.startEvaluation(from_block, function evaluated(err, value) {

				var next_blocks;

				// If this block has already emitted an ignored event,
				// don't do anything
				if (ignored) {
					return;
				}

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
			}, function special(command) {

				// Default to the 'ignore' command
				if (command == null) {
					command = 'ignore';
				}

				// When the 'ignore' command is received,
				// don't call any next blocks, just call next
				if (command == 'ignore') {
					ignored = true;
					next();
				}
			});
		});
	});

	// Do the tasks
	Function.parallel(tasks, callback);
});