/**
 * The Command History Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var CHM = Model.extend(function CommandHistoryModel() {

	var chimera,
	    list,
	    edit;

	CommandHistoryModel.super.call(this, options);

	// Create the chimera behaviour
	chimera = this.addBehaviour('chimera');

	// Get the list group
	list = chimera.getActionFields('list');

	list.addField('device_id');
	list.addField('interface');
	list.addField('room_id');
	list.addField('command');

	// Get the edit group
	edit = chimera.getActionFields('edit');

	edit.addField('device_id');
	edit.addField('interface');
	edit.addField('room_id');
	edit.addField('command');
	edit.addField('origin');

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