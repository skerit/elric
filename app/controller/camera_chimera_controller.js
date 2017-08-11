var MediaConversion = alchemy.use('mediaconversion');

/**
 * The Camera Chimera Controller class
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Camera = Function.inherits('Alchemy.ChimeraController', function CameraChimeraController(conduit, options) {
	CameraChimeraController.super.call(this, conduit, options);
});

/**
 * Show all cameras
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Camera.setMethod(function index(conduit) {

	var that = this;

	this.set('pagetitle', 'Cameras');

	this.getModel('Camera').find('all', {recursive: 2}, function gotCameras(err, records) {

		if (err) {
			return that.error(err);
		}

		that.set('records', records)
		that.render('camera/chimera_index');
	});
});

/**
 * Edit the camera
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Camera.setMethod(function edit(conduit, subject, action, id) {

	var that = this;

	this.getModel('Camera').findById(id, {recursive: 2}, function gotCameras(err, record) {

		if (err) {
			return that.error(err);
		}

		that.set('pagetitle', 'Camera ' + record.name);
		that.set('record', record)
		that.render('camera/chimera_edit');
	});
});

/**
 * Receive linkups
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param   {Conduit}   conduit
 */
Camera.setMethod(function webStream(conduit, camera_id) {

	var that = this,
	    conv;

	this.getModel('Camera').findById(camera_id, function gotCamera(err, record) {

		if (err) {
			return conduit.error(err);
		}

		console.log(' -- Getting camera stream', record);

		record.getStream(function gotStream(err, stream) {

			var conv_options;

			if (err) {
				return conduit.error(err);
			}

			// Test a direct stream
			//return stream.pipe(conduit.response);

			// Create a new conversion object
			conv = new MediaConversion();

			// Set the input stream
			conv.setInput(stream);

			conv_options = {
				//extra_args: ['-crf', '18', '-vsync', '1'],
				realtime: true,
				profile: 'mp4',
				bufsize: null,
				copyts: null
				//probe: false
			};

			if (record.settings.media_type == 'mjpeg') {
				conv_options.variable_framerate = true;
				conv_options.extra_args = ['-vsync', '2'];
			}

			console.log('Converting with:', conv_options);

			conv.start(conduit.response, conv_options);
		});
	});
});

/**
 * Receive linkups
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param   {Conduit}   conduit
 */
Camera.setMethod(function createLink(conduit, linkup, config) {

	var that = this;

	console.log('Got linkup:', conduit, linkup, config);

	if (!config.camera_id) {
		return conduit.error(new Error('No camera id given'));
	}

	this.getModel('Camera').findById(config.camera_id, function gotCamera(err, record) {

		if (err) {
			return conduit.error(err);
		}

		console.log(' -- Getting camera stream', record);

		// Get a raw video stream
		record.getStream(function gotStream(err, stream) {

			var conv,
			    data,
			    sockstream,
			    conv_options;

			if (err) {
				return conduit.error(err);
			}

			// Create a new conversion object
			conv = new MediaConversion({make_it_live: true});

			// Create a new stream meant for the client
			sockstream = conduit.createStream();

			// -pix_fmt yuv420p

			// Set the input stream
			conv.setInput(stream); // 'http://admin:Twadi8923@192.168.1.19/audio.cgi'

			// Disable audio
			//conv.enableAudio(false);

			// Get the type of media, important for MediaSource
			conv.getMseType(function gotMseType(err, type) {

				if (err) {
					return linkup.error(err);
				}

				console.log('Got type:', type, 'for record', record);

				data = {
					codec: type //'video/mp4; codecs="avc1.42001e, mp4a.40.2"'
				};

				linkup.submit('stream', data, sockstream);
			});

			conv_options = {

				// Make encoding realtime (for mp4/h264)
				realtime: true,

				// Use jsmpeg or mp4 profile
				profile: config.jsmpeg ? 'jsmpeg' : 'mp4',

				force_audio_encode: true
			};

			conv_options = Object.assign(conv_options, record.getConversionOptions());

			// If the source is an mjpeg stream,
			// make sure ffmpeg knows it's a variable framerate thing
			if (record.settings.media_type == 'mjpeg') {
				conv_options.variable_framerate = true;
				conv_options.extra_args = ['-vsync', '2'];
			} else {
				// C2 test
				//conv_options.input_type = 'h264';
			}

			console.log('Converting with:', conv_options);

			conv.start(sockstream, conv_options);
		});
	});
});

// Add the dashboard to the menu deck
alchemy.plugins.chimera.menu.set('cameras', {
	title: 'Cameras',
	route: 'chimera@ActionLink',
	parameters: {
		controller: 'Camera',
		action: 'index'
	},
	icon: {svg: 'connection'}
});