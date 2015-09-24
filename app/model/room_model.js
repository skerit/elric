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

	var element_schema = new alchemy.classes.Schema();

	this.addField('name', 'String');
	this.addField('x', 'Number');
	this.addField('y', 'Number');
	this.addField('z', 'Number');
	this.addField('width', 'Number');
	this.addField('height', 'Number');

	element_schema.addField('_id', 'ObjectId');
	element_schema.addField('name', 'String');
	element_schema.addField('element_type', 'String');
	element_schema.addField('type_external_id', 'ObjectId');
	element_schema.addField('x', 'Number');
	element_schema.addField('y', 'Number');
	element_schema.addField('dx', 'Number');
	element_schema.addField('dy', 'Number');
	element_schema.addField('width', 'Number');
	element_schema.addField('height', 'Number');

	this.addField('elements', 'Schema', {array: true, schema: element_schema});
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