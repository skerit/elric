/**
 * The Tag Model class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Tag = Function.inherits('Alchemy.AppModel', function TagModel(conduit, options) {
	TagModel.super.call(this, conduit, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Tag.constitute(function addFields() {

	// Name of the tag
	this.addField('name', 'String', {unique: true});

	// The description of this tag
	this.addField('description', 'String');

	// Add indexes
	this.addIndex('name', {name: 'text'});
	this.addIndex('description', {name: 'text'});
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Tag.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('name');
	list.addField('description');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('name');
	edit.addField('description');
});
