var all_blocks = alchemy.shared('elric.scenario_block');

/**
 * The Device Chimera Controller class
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Scenario = Function.inherits('ChimeraController', function ScenarioChimeraController(conduit, options) {
	ScenarioChimeraController.super.call(this, conduit, options);
});

/**
 * Show all scenarios
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Scenario.setMethod(function index(conduit) {

	var that = this;

	this.set('pagetitle', 'Scenarios');

	this.getModel('Scenario').find('all', {recursive: 2}, function gotScenarios(err, records) {

		if (err) {
			return that.error(err);
		}

		that.set('records', records)
		that.render('scenario/chimera_index');
	});
});

/**
 * Create a scenario
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Scenario.setMethod(function create(conduit) {

	var that = this,
	    Scenario = this.getModel('Scenario'),
	    client,
	    data,
	    id;

	data = Scenario.compose();
	data.name = 'new-' + Date.now();

	Scenario.save(data, function saved(err, record) {

		if (err) {
			return conduit.error(err);
		}

		if (!record.length) {
			return conduit.notFound();
		}

		that.set('all_blocks', that.getBlockInfo());
		that.set('scenario', record);
		that.render('scenario/chimera_edit');
	});
});

/**
 * Edit a scenario
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Scenario.setMethod(function edit(conduit) {

	var that = this,
	    client,
	    id = conduit.param('id');

	if (!id) {
		return conduit.notFound();
	}

	this.getModel('Scenario').findById(id, function gotScenario(err, record) {

		if (err) {
			return conduit.error(err);
		}

		if (!record.length) {
			return conduit.notFound();
		}

		that.set('all_blocks', that.getBlockInfo());
		that.set('scenario', record);
		that.render('scenario/chimera_edit');
	});
});

/**
 * Save a scenario
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Scenario.setMethod(function save(conduit) {

	var that = this,
	    scenario = conduit.body.scenario,
	    client,
	    id = conduit.param('id');

	if (!id) {
		return conduit.error('No id given');
	}

	if (!scenario || !scenario.blocks) {
		return conduit.error('No blocks given to save');
	}

	this.getModel('Scenario').findById(id, function gotScenario(err, record) {

		if (err) {
			return conduit.error(err);
		}

		if (!record.length) {
			return conduit.notFound();
		}

		// Overwrite the blocks
		record.blocks = scenario.blocks;

		// Save the record
		record.save(function saved(err) {

			console.log('Saved?', err);

			if (err) {
				return conduit.error(err);
			}

			conduit.end({saved: true});
		});
	});
});

/**
 * Send block description
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Scenario.setMethod(function block_description(conduit) {

		var that = this,
	    block_id = conduit.param('block_id'),
	    client,
	    id = conduit.param('id');

	if (!id) {
		return conduit.error('No scenario id given');
	}

	if (!block_id) {
		return conduit.error('No block id given');
	}

	this.getModel('Scenario').findById(id, function gotScenario(err, record) {

		var block;

		if (err) {
			return conduit.error(err);
		}

		if (!record.length) {
			return conduit.notFound();
		}

		block = record.getBlock(block_id);

		if (!block) {
			return conduit.notFound('Invalid block');
		}

		block.doGetDescription(function gotDescription(err, text) {

			if (err) {
				return conduit.error(err);
			}

			conduit.send({description: text});
		});
	});
});

/**
 * The config action
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param   {Conduit}   conduit
 */
Scenario.setMethod(function configure_block(conduit) {

	var that = this,
	    Scenario = this.getModel('Scenario'),
	    block_id = conduit.param('block_id'),
	    scenario_id = conduit.param('id'),
	    do_render = conduit.param('render');

	if (!scenario_id) {
		return conduit.error(new Error('No scenario id given'));
	}

	if (!block_id) {
		return conduit.error(new Error('No block id given'));
	}

	// Get the scenario
	Scenario.findById(scenario_id, function gotScenario(err, scenario) {

		var action_type,
		    field_names,
		    blocks,
		    schema,
		    block,
		    tasks,
		    data;

		if (err) {
			return conduit.error(err);
		}

		if (!scenario.length) {
			return conduit.notFound('No scenario with id "' + scenario_id + '" found');
		}

		// Get all the blocks in this scenario
		blocks = scenario.getSortedBlocks().all;

		// Get the block by its id
		block = blocks[block_id];

		if (!block) {
			return conduit.notFound('No block with id "' + block_id +'" found');
		}

		if (conduit.method == 'post') {
			data = conduit.body.data;

			if (data == null) {
				return conduit.error('No data given');
			}

			// Overwrite all the data (everything should be given)
			Object.assign(block.settings, data);
			
			scenario.save(function saved(err) {

				if (err) {
					return conduit.error(err);
				}

				conduit.end({success: true});
			});

			return;
		}

		// @TODO: For now, we use the 'edit' action type,
		// this will get all the fields in the chimera edit grou
		// from the schema. Another default is 'list'
		// We should probably create another action group,
		// like 'edit-block', so we can remove certain fields
		action_type = 'edit';

		// All asynchronous field getting tasks will go here
		tasks = [];

		// Get this block's configuration schema
		schema = block.constructor.schema;

		// Get all the field names from that schema
		field_names = schema.getFieldNames();

		// Iterate over all the field names
		field_names.forEach(function eachName(field_name, i) {

			var cfield,
			    field;

			// Get the FieldType from the schema
			field = schema.getField(field_name);

			// Get the ChimeraField from the FieldType
			cfield = field.getChimeraField({action: action_type});

			// Schedule a new task
			tasks.push(function getValue(next) {

				// Get the action value
				cfield.actionValue(action_type, block.settings, function gotValue(err, value) {

					if (err) {
						return next(err);
					}

					next(null, {
						// The chimera field
						field: cfield,

						// The resulting action value
						value: value,

						// The root model is 'Scenario'
						root_model: 'Scenario',

						// The root id is the current scenario id
						root_id: scenario_id,

						// The nested path (everything is in 'settings')
						nested_path: 'Scenario.blocks.' + block.index + '.settings'
					});
				});
			});
		});

		// Perform all tasks
		Function.parallel(tasks, function gotResults(err, cfields) {

			if (err) {
				return conduit.error(err);
			}

			if (do_render) {
				that.set('cfields', cfields);
				// @TODO: set correct element
				that.render('static/test');
			} else {
				conduit.end(cfields);
			}
		});
	});
});


/**
 * Get block information for the client
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Scenario.setMethod(function getBlockInfo() {

	var result = {},
	    block,
	    proto,
	    data,
	    key;

	for (key in all_blocks) {
		block = all_blocks[key];

		// Get the prototype
		proto = block.prototype;

		// Create the data object
		data = {
			entrance_point  : proto.entrance_point,
			has_entrance    : proto.has_entrance,
			exit_names      : proto.exit_names,
			title           : block.title,
			name            : key,
			schema          : proto.schema.getDict()
		};

		result[key] = data;
	}

	return result;
});


// Add the dashboard to the menu deck
alchemy.plugins.chimera.menu.set('scenarios', {
	title: 'Scenarios',
	route: 'chimera@ActionLink',
	parameters: {
		controller: 'Scenario',
		action: 'index'
	},
	icon: {svg: 'connection'}
});