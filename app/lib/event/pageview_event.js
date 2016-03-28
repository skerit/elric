/**
 * The Pageview Event class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {EventDocument}   document   The (not necesarily saved) document
 */
var Pageview = Function.inherits('Elric.Event', function PageviewEvent(document) {
	PageviewEvent.super.call(this, document);
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Pageview.constitute(function setSchema() {

	// The requested URL
	this.schema.addField('url', 'String');

	// The IP address of the visiting user
	this.schema.addField('ip', 'String');

	// The request headers
	this.schema.addField('headers', 'Object');

	// The request method
	this.schema.addField('method', 'String');

	// The response status number
	this.schema.addField('status', 'Number');

	// @TODO: user detection
	// @TODO: body
});

/**
 * Set event specific data,
 * should only be called for new events
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Pageview.setMethod(function initialize(conduit, viewrender) {
	this.payload.url = conduit.originalPath;
	this.payload.ip = conduit.ip;
	this.payload.headers = conduit.headers;
	this.payload.method = conduit.method;

	// @todo: should be delayed (will always be 200?)
	this.payload.status = conduit.status;
});