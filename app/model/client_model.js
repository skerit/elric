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

	var chimera,
	    list,
	    edit;

	ClientModel.super.call(this, options);

	// Create the chimera behaviour
	chimera = this.addBehaviour('chimera');

	// Get the list group
	list = chimera.getActionFields('list');

	list.addField('name');
	list.addField('key');
	list.addField('hostname');
	list.addField('ip');

	// Get the edit group
	edit = chimera.getActionFields('edit');

	edit.addField('name');
	edit.addField('key');
	edit.addField('hostname');
	edit.addField('ip');
});

Client.addField('name', 'String');
Client.addField('key', 'String');
Client.addField('hostname', 'String');
Client.addField('ip', 'String');