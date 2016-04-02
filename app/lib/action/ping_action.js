var libping = alchemy.use('ping');

/**
 * The Ping Action class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {ActionDocument}   document   The (not necesarily saved) document
 */
var Ping = Function.inherits('Elric.Action', function PingAction(document) {
	PingAction.super.call(this, document);
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Ping.constitute(function setSchema() {

	// Identifier for this action
	this.schema.addField('description', 'String');

	// The address or ip to ping
	this.schema.addField('address', 'String');

	// The timeout
	this.schema.addField('timeout', 'Number', {default: 2000});
});

/**
 * Callback with a nice description to display in the scenario editor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {Function}   callback
 */
Ping.setMethod(function getDescription(callback) {

	var result = 'Ping ';

	if (this.payload.description) {
		result += this.payload.description;
	} else if (this.payload.address) {
		result += this.payload.address;
	} else {
		result += '(not configured)';
	}

	callback(null, result);
});

/**
 * Set event specific data,
 * should only be called for new events
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Ping.setMethod(function execute(callback) {

	var that = this,
	    payload = this.payload,
	    timeout;

	if (!payload.address) {
		return callback(new Error('No address has been defined'));
	}

	timeout = payload.timeout / 1000;

	if (!timeout) {
		timeout = 2;
	}

	libping.promise.probe(payload.address, {
		timeout: timeout
	}).then(function gotResponse(res) {
		if (res.alive) {
			callback(null, true);
		} else {
			callback(null, false);
		}
	}).done();
});