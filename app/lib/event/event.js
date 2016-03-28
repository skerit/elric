/**
 * The Base Event class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {EventDocument}   document   The (not necesarily saved) document
 */
var Event = Function.inherits('Elric.Wrapper', function Event(document) {

	var payload;

	if (!document) {
		throw new Error('Events must be provided with a document');
	}

	// Store the document
	this.document = document;

	// Get the payload
	payload = this.document.payload;

	// If no payload exists, create it now
	if (!payload) {
		payload = this.schema.process();
		this.document.payload = payload;
	}

	// Store the payload on the event
	this.payload = payload;
});

/**
 * This is a wrapper class
 */
Event.setProperty('extend_only', true);

/**
 * This wrapper class starts a new group
 */
Event.setProperty('starts_new_group', true);

/**
 * Return the class-wide schema
 *
 * @type   {Schema}
 */
Event.setProperty(function schema() {
	return this.constructor.schema;
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Event.constitute(function setSchema() {

	var schema;

	// Create a new schema
	schema = new alchemy.classes.Schema(this);
	this.schema = schema;

	// Every event has a start and end property
	schema.addField('start', 'Datetime');
	schema.addField('end', 'Datetime');
});

/**
 * Set event specific data,
 * should only be called for new events.
 * Return false if the event should not be fired
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Event.setMethod(function initialize() {
	throw new Error('Descendants should create their own initialize method');
});

/**
 * Save the event document
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Event.setMethod(function save(callback) {
	return this.document.save(callback);
});