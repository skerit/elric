var Bot = alchemy.use('node-telegram-bot');

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
var Telegram = Function.inherits('Elric.Action', function TelegramAction(document) {
	TelegramAction.super.call(this, document);
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Telegram.constitute(function setSchema() {

	// The API token (if not entered, gotten from settings)
	this.schema.addField('token', 'String');

	// The to field
	this.schema.addField('to', 'String', {array: true});

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
Telegram.setMethod(function execute(callback) {

	var that = this,
	    options,
	    token = this.payload.token,
	    bot,
	    to = Array.cast(this.payload.to)[0];

	if (!token) {
		return callback(new Error('No token was defined'));
	}

	if (!to) {
		return callback(new Error('No user was defined'));
	}

	// Create the bot instance
	bot = new Bot({token: token});

	// Listen for messages
	bot.on('message', function onMessage(msg) {
		console.log('Bot received message:', msg);
	});

	bot.start();

	// Construct the options
	options = {
		chat_id: to,
		text: this.payload.body
	};

	bot.sendMessage(options, function done(err, result) {

		if (err) {
			return callback(err);
		}

		bot.stop();

		return callback(null, result);
	});
});