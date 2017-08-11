var Rudeplay = elric.use('rudeplay'),
    Sonority = elric.use('sonority'),
    Speaker = elric.use('speaker'),
    lame = elric.use('lame'),
    dgram = require('dgram');

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

	// Type is always udp4, for now
	this.socket_type = 'udp4';


	// Old, mp3 stream way
	this.onLinkup('audio_stream', function gotLinkup(linkup, data) {

		var player = new Sonority({debug: true});

		linkup.on('stream', function gotStream(data, stream) {

			console.log('Loading stream', stream);

			player.load(stream, function loaded() {
				linkup.submit('loaded');
			});
		});

		linkup.on('play', function play(start_time) {

			var now = elric.now(),
			    diff = start_time - now;

			console.log('Server requests audio play in', diff, 'ms');

			if (diff > 0) {
				Blast.setTimeout(function delayed() {

					var end = elric.now();

					player.backend.cvlc.resume();

					console.log('PLAY:', elric.now(), 'Elapsed:', end-now);
				}, diff);
			} else {
				console.log('Already too late, starting play immediately!');
				player.backend.cvlc.resume();
			}
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

	// Create the server
	this.rtp_server = dgram.createSocket(this.socket_type);

	// Listen for server messages
	this.rtp_server.on('message', function gotRtpMessage(msg, remote_info) {

		var body,
		    seq;

		seq = msg.readUInt16BE(2);

		that.mp3_decoder.write(msg);



		console.log('Got sequence nr', seq, 'msg length:', msg.length);
	});

	// Start the server
	this.rtp_server.bind(function bound() {

		var addr = that.rtp_server.address();

		log.info('Started audio device, listening on ' + addr.port);

		//that.submit('audio_unicast_port', addr.port)

		that.remoteCommand('storePort', 'unicast', addr.port);


		callback(null);
	});

	// Create the mp3 decoder
	this.mp3_decoder = new lame.Decoder();

	// Create the speaker instance
	this.speaker = new Speaker({
		channels: 2,          // 2 channels 
		bitDepth: 16,         // 16-bit samples 
		sampleRate: 44100     // 44,100 Hz sample rate 
	});

	this.mp3_decoder.pipe(this.speaker);

	// Create new rudeplay server
	this.rudeplay_server = new Rudeplay.Server.Server({
		name: this.client.hostname
	});

	console.log('Created rudeplay server:', this.rudeplay_server);
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
	this.rudeplay_server.destroy();
});

module.exports = Audio;