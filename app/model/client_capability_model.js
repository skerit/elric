var all_capabilities = alchemy.getClassGroup('elric_capability');

/**
 * The Client Capability Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var ClientCapability = Model.extend(function ClientCapabilityModel(options) {
	ClientCapabilityModel.super.call(this, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ClientCapability.constitute(function addFields() {
	this.addField('name', 'String'); // Enum?
	this.addField('enabled', 'Boolean');
	this.addField('settings', 'Object');

	this.belongsTo('Client');

	this.Document.setFieldGetter('capability', function getCapability() {
		if (all_capabilities[this.name]) {
			return new all_capabilities[this.name]();
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
ClientCapability.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('client_id');
	list.addField('name');
	list.addField('enabled');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('client_id');
	edit.addField('name');
	edit.addField('enabled');
});

/**
 * Load base capability settings for the config view
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ClientCapability.setDocumentMethod(function setupConfigView(controller, callback) {

	var that = this,
	    tasks = [],
	    i;

	this._records.forEach(function eachRecord(record) {

		var instance,
		    name = record.ClientCapability.name;

		// Get the capability instance, if it isn't available do nothing
		if (all_capabilities[name]) {
			instance = new all_capabilities[name];
		} else {
			return;
		}

		// If this instance does not have a configurator for the view, do nothing
		if (!instance.setupConfigView) {
			return;
		}

		tasks.push(function processRecord(next) {
			instance.setupConfigView(controller, record.ClientCapability, next);
		});
	});

	Function.parallel(tasks, callback);
});