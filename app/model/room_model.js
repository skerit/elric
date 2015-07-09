/**
 * The Room Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var Room = Model.extend(function RoomModel(options) {

	RoomModel.super.call(this, options);

	this.icon = 'home';
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Room.constitute(function addFields() {

	this.addField('name', 'String');
	this.addField('x', 'Number');
	this.addField('y', 'Number');
	this.addField('z', 'Number');
	this.addField('width', 'Number');
	this.addField('height', 'Number');
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Room.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('name');
	list.addField('z');
	list.addField('x');
	list.addField('y');
	list.addField('width');
	list.addField('height');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('name');
	edit.addField('z');
	edit.addField('x');
	edit.addField('y');
	edit.addField('width');
	edit.addField('height');
});