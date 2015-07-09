/**
 * The Client Capability Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var ClientCapability = Model.extend(function ClientCapabilityModel(options) {
	ClientCapabilityModel.super.call(this, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    1.0.0
 * @version  1.0.0
 */
ClientCapability.constitute(function addFields() {
	this.addField('capability', 'Enum');
	this.addField('enabled', 'Boolean');
	this.addField('settings', 'Object');

	this.belongsTo('Client');
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
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
	list.addField('capability');
	list.addField('enabled');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('client_id');
	edit.addField('capability');
	edit.addField('enabled');
});