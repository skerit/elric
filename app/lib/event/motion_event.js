/**
 * The Motion Event class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {EventDocument}   document   The (not necesarily saved) document
 */
var Motion = Function.inherits('Elric.Event', function MotionEvent(document) {
	MotionEvent.super.call(this, document);
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Motion.constitute(function setSchema() {

	// Motion events belong to a certain camera
	this.schema.belongsTo('Camera');

});

/**
 * Set event specific data,
 * should only be called for new events
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Motion.setMethod(function initialize(conduit, viewrender) {
	this.payload.url = conduit.originalPath;
	this.payload.ip = conduit.ip;
	this.payload.headers = conduit.headers;
	this.payload.method = conduit.method;

	// @todo: should be delayed (will always be 200?)
	this.payload.status = conduit.status;
});