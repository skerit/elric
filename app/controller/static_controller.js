/**
 * The Static Controller class
 *
 * @constructor
 * @extends       alchemy.classes.AppController
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Static = Function.inherits('AppController', function StaticController(conduit, options) {
	StaticController.super.call(this, conduit, options);
});

/**
 * The home action
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param   {Conduit}   conduit
 */
Static.setMethod(function home(conduit) {

	var that = this;

	that.render('static/home');
});

/**
 * The test action
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param   {Conduit}   conduit
 */
Static.setMethod(function test(conduit) {

	var that = this,
	    Scenario = this.getModel('Scenario'),
	    scenario_id;

	// The scenario id
	scenario_id = '56f9446bc14a8c345ea73e4b';

	// Get the scenario
	Scenario.findById(scenario_id, function gotScenario(err, scenario) {

		var action_type,
		    blocks,
		    tasks;

		if (err) {
			return conduit.error(err);
		}

		// @TODO: For now, we use the 'edit' action type,
		// this will get all the fields in the chimera edit grou
		// from the schema. Another default is 'list'
		// We should probably create another action group,
		// like 'edit-block', so we can remove certain fields
		action_type = 'edit';

		// All asynchronous field getting tasks will go here
		tasks = [];

		// Get all the blocks in this scenario
		blocks = scenario.getSortedBlocks().all;

		// Go over each block
		// @todo: we probably only want a single block
		Object.each(blocks, function eachBlock(block, key) {

			var field_names,
			    schema;

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
		});

		// Perform all tasks
		Function.parallel(tasks, function gotResults(err, cfields) {

			if (err) {
				return conduit.error(err);
			}

			that.set('cfields', cfields);
			that.render('static/test');
		});
	});
});
