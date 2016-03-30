var nodemailer = alchemy.use('nodemailer');

/**
 * The Mail Action class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {ActionDocument}   document   The (not necesarily saved) document
 */
var Mail = Function.inherits('Elric.Action', function MailAction(document) {
	MailAction.super.call(this, document);
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Mail.constitute(function setSchema() {

	// The to field
	this.schema.addField('to', 'String', {array: true});

	// The cc field
	this.schema.addField('cc', 'String', {array: true});

	// The bcc field
	this.schema.addField('bcc', 'String', {array: true});

	// The subject
	this.schema.addField('subject', 'String');

	// And the body
	this.schema.addField('body', 'Text');
});

/**
 * Set event specific data,
 * should only be called for new events
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Mail.setMethod(function execute(callback) {

	var transporter = nodemailer.createTransport();

	console.log('Should send mail about', this,'?');

	transporter.sendMail({
		from: 'elric@loeckout.us.to',
		to: 'jelle@kipdola.be',
		subject: 'Elric says hello',
		text: 'Body test!'
	}, function done(err, response) {
		console.log('Done mail:', err, response);
	});

	callback(null, true);
});