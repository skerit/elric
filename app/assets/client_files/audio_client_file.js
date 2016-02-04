var Sonority = elric.use('sonority');

/**
 * The Audio ClientFile
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Audio = Function.inherits('ClientFile', function AudioClientFile(client, settings) {

	var that = this;

	// Call the parent constructor
	AudioClientFile.super.call(this, client, settings);

	log.info('Audio device client file...');
	console.log(this.client);

	this.onLinkup('audio_stream', function gotLinkup(linkup, data) {

		var player = new Sonority({debug: true});

		linkup.on('stream', function gotStream(data, stream) {
			console.log('Loading stream', stream);
			player.load(stream, function loaded() {
				console.log('Stream has loaded');
				linkup.submit('loaded');
			});
		});

		linkup.on('play', function play() {
			console.log('Server tells us to play the file at', Date.now());
			player.backend.cvlc.resume();
			//player.play();
		});

		console.log('Got audio linkup:', linkup, data);

	});

	//process.stdin.pipe(speaker);
});

/**
 * Startup!
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Audio.setMethod(function start(callback) {

	var that = this,
	    device;

	log.info('Starting audio device');

	//player.play('foo.mp3', function(err){})

	log.info('Started audio device!');
});

/**
 * Stop
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Audio.setMethod(function stop() {
	console.log('Client disconnected, audio is stopping');
});

module.exports = Audio.create;