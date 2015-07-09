/**
 * The Command History Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var CHM = Model.extend(function CommandHistoryModel(options) {

	CommandHistoryModel.super.call(this, options);

	this.icon = 'time';
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    1.0.0
 * @version  1.0.0
 */
CHM.constitute(function addFields() {

	this.belongsTo('Device');
	this.belongsTo('Interface');
	this.belongsTo('Room');

	this.addField('command', 'String');
	this.addField('origin', 'Object');
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
CHM.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('device_id');
	list.addField('interface_id');
	list.addField('room_id');
	list.addField('command');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('device_id');
	edit.addField('interface_id');
	edit.addField('room_id');
	edit.addField('command');
	edit.addField('origin');
});