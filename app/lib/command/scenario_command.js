/**
 * The Elric Scenario Command
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var ScenarioCmd = Function.inherits('Alchemy.Command', function ScenarioCommand() {
	ScenarioCommand.super.call();
});

/**
 * Set the command configuration schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ScenarioCmd.constitute(function setSchema() {

	// The scenario to run (scenario_id)
	this.schema.belongsTo('Scenario');

	// The event to apply to the scenario
	this.schema.addField('event');
});

/**
 * Execute the scenario
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ScenarioCmd.setMethod(function execute(options, callback) {

	var that = this,
	    Scenario;

	if (!options.scenario_id) {
		return callback(new Error('No scenario id given'));
	}

	Scenario = Model.get('Scenario');

	// Find the wanted scenario
	Scenario.findById(options.scenario_id, function gotScenario(err, scenario) {

		if (err) {
			return callback(err);
		}

		scenario.applyEvent(options.event, callback);
	});
});