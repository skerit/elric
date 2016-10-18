var all_actions = alchemy.getClassGroup('elric_action');

/**
 * The Action Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Action = Model.extend(function ActionModel(options) {
	ActionModel.super.call(this, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Action.constitute(function addFields() {

	// Action type
	this.addField('type', 'Enum', {values: all_actions});

	// The action data
	this.addField('payload', 'Object');

	// From which event this came
	this.belongsTo('FromEvent', 'Event');

	// From which scenario this came
	this.belongsTo('FromScenario', 'Scenario');

	this.Document.setFieldGetter('action', function getAction() {
		if (all_actions[this.type]) {
			return new all_actions[this.type](this);
		}
	});
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Action.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('created');
	list.addField('type');
});