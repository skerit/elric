/**
 * The Sound Action class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {ActionDocument}   document   The (not necesarily saved) document
 */
var Sound = Function.inherits('Elric.Action', function SoundAction(document) {
	SoundAction.super.call(this, document);
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Sound.constitute(function setSchema() {

	// The sound to play
	this.schema.addField('sound', 'String');
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
Sound.setMethod(function getDescription(callback) {

	var result;

	if (this.payload.sound) {
		result = 'Play the "' + this.payload.sound + '" sound file';
	} else {
		result = 'Play a sound (not configured)';
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
Sound.setMethod(function execute(callback) {

	var that = this;

	if (!this.payload.sound) {
		return callback(new Error('No sound file has been given'));
	}

	console.log('Playing sound on server', this.payload.sound);

	elric.playSound(this.payload.sound, function playing(err) {

		if (err) {
			return callback(err);
		}

		return callback(null, true);
	});
});