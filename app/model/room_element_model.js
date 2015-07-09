/**
 * The Room Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var RoomElement = Model.extend(function RoomElementModel(options) {

	RoomElementModel.super.call(this, options);

	this.element_types = alchemy.shared('Elric.elementTypes');

	this.icon = 'lightbulb-o';
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    1.0.0
 * @version  1.0.0
 */
RoomElement.constitute(function addFields() {

	this.belongsTo('Room');

	this.addField('name', 'String');
	this.addField('element_type', 'Enum');
	this.addField('type_external_id', 'ObjectId');
	this.addField('x', 'Number');
	this.addField('y', 'Number');
	this.addField('dx', 'Number');
	this.addField('dy', 'Number');
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
RoomElement.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('name');
	list.addField('room_id');
	list.addField('element_type');
	list.addField('type_external_id');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('name');
	edit.addField('room_id');
	edit.addField('element_type');
	edit.addField('type_external_id');
	edit.addField('x');
	edit.addField('y');
	edit.addField('dx');
	edit.addField('dy');
	edit.addField('width');
	edit.addField('height');
});