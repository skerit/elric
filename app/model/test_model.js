/**
 * The Test Model class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Test = Function.inherits('Alchemy.AppModel', function TestModel(conduit, options) {
	TestModel.super.call(this, conduit, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Test.constitute(function addFields() {

	var sub = new Classes.Alchemy.Schema();

	this.addField('name', 'String');
	this.addField('title', 'String', {translatable: true});
	this.addField('alias', 'String', {array: true});

	sub.addField('sub_name', 'String');
	sub.addField('sub_title', 'String');

	this.addField('sub', 'Schema', {schema: sub, array: true});
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Test.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('name');
	list.addField('title');
	list.addField('alias');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	// edit.addField('name');
	// edit.addField('title');
	edit.addField('alias');
	edit.addField('sub');
});
