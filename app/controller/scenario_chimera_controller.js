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
 * Configure a client
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