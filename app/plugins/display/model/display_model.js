/**
 * The Display Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var Display = Model.extend(function DisplayModel(options) {
	DisplayModel.super.call(this, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Display.constitute(function addFields() {
	this.addField('name', 'String');
});