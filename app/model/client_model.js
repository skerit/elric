/**
 * The Client Capability Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var Client = Model.extend(function ClientModel(options) {
	ClientModel.super.call(this, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Client.constitute(function addFields() {
	this.addField('name', 'String');
	this.addField('key', 'String');
	this.addField('hostname', 'String');
	this.addField('ip', 'String');
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Client.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('name');
	list.addField('key');
	list.addField('hostname');
	list.addField('ip');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('name');
	edit.addField('key');
	edit.addField('hostname');
	edit.addField('ip');
});