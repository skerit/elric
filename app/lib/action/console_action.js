/**
 * The Console Action class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {ActionDocument}   document   The (not necesarily saved) document
 */
var Console = Function.inherits('Elric.Action', function ConsoleAction(document) {
	ConsoleAction.super.call(this, document);
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Console.constitute(function setSchema() {

	// The arguments
	this.schema.addField('arguments', 'Array');
});

/**
 * Set event specific data,
 * should only be called for new events
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Console.setMethod(function execute(callback) {
	console.log('Console log:', this);
	callback(null, true);
});