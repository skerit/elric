var interfaces = alchemy.getClassGroup('elric_interface');

/**
 * The Interface Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Interface = Model.extend(function InterfaceModel(options) {
	InterfaceModel.super.call(this, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Interface.constitute(function addFields() {

	this.belongsTo('Client');

	this.addField('title', 'String');
	this.addField('type', 'Enum', {values: alchemy.getClassGroup('elric_interface')});
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
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
 * @author   Jelle De Loecker   <jelle@develry.be>
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
 * The interface instance property
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Interface.setDocumentProperty(function instance() {

	if (!this._instance) {
		this._instance = this.createInstance();
	}

	return this._instance;
});

/**
 * Create a new instance of this interface type
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Interface.setDocumentMethod(function createInstance() {
	return new interfaces[this.type];
});

/**
 * Send a command to this interface
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}   address   The address of the device
 * @param    {Object}   options
 * @param    {Function} callback
 */
Interface.setDocumentMethod(function sendCommand(address, options, callback) {

	var that = this;

	if (typeof options == 'function') {
		callback = options;
		options = {};
	}

	if (!callback) {
		callback = Function.thrower;
	}

	if (!this.client_id) {
		return callback(new Error("Can't send command to interface when client id is not set"));
	}

	this.instance.sendCommand(this.client_id, address, options, callback);
});