var interfaces = alchemy.shared('elric.interface');

/**
 * The Interface Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var Interface = Model.extend(function InterfaceModel(options) {
	InterfaceModel.super.call(this, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Interface.constitute(function addFields() {

	this.belongsTo('Client');

	this.addField('title', 'String');
	this.addField('type', 'Enum', {values: alchemy.shared('elric.interface')});
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Interface.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('title');
	list.addField('client_id');
	list.addField('type');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('title');
	edit.addField('client_id');
	edit.addField('type');
});

/**
 * Prepare the recordset before saving
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
Interface.setMethod(function prepareSave(recordset) {

	var item = recordset.Interface;

	if (!item.title) {
		item.title = item.interface_type + ' on ' + item.client_id;
	}

	return recordset;
});

/**
 * Get an instance of the interface type
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Interface.setDocumentMethod(function createInstance() {
	return new interfaces[this.type];
});