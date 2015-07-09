/**
 * The Device Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var Device = Model.extend(function DeviceModel(options) {

	DeviceModel.super.call(this, options);

	this.device_types = alchemy.shared('device.Types');
	this.automation_protocols = alchemy.shared('AutomationProtocols');
	this.interface_types = alchemy.shared('Elric.interfaces');

	this.icon = 'lightbulb';
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Device.constitute(function addFields() {

	this.belongsTo('Interface');

	this.addField('name', 'String');
	this.addField('device_type', 'Enum');
	this.addField('automation_protocol', 'Enum');
	this.addField('address', 'Object');
	this.addField('interface_type', 'Enum');
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Device.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('name');
	list.addField('device_type');
	list.addField('automation_protocol');
	list.addField('address');
	list.addField('interface_type');
	list.addField('interface_id');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('name');
	edit.addField('device_type');
	edit.addField('automation_protocol');
	edit.addField('address');
	edit.addField('interface_type');
	edit.addField('interface_id');
});