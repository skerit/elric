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

	var chimera,
	    list,
	    edit;

	ClientCapabilityModel.super.call(this, options);

	// Create the chimera behaviour
	chimera = this.addBehaviour('chimera');

	// Get the list group
	list = chimera.getActionFields('list');

	list.addField('client_id');
	list.addField('capability');
	list.addField('enabled');

	// Get the edit group
	edit = chimera.getActionFields('edit');

	edit.addField('client_id');
	edit.addField('capability');
	edit.addField('enabled');
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