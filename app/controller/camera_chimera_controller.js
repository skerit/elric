var MediaConversion = alchemy.use('mediaconversion');

/**
 * The Camera Chimera Controller class
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Camera = Function.inherits('ChimeraController', function CameraChimeraController(conduit, options) {
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

		records.getStream();

		that.set('records', records)
		that.render('camera/chimera_index');
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
				profile: 'mp4'
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
Camera.setMethod(function createLink(conduit, linkup, data) {

	var that = this;

	console.log('Got linkup:', conduit, linkup, data);

	if (!data.camera_id) {
		return conduit.error(new Error('No camera id given'));
	}

	this.getModel('Camera').findById(data.camera_id, function gotCamera(err, record) {

		if (err) {
			return conduit.error(err);
		}

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

				console.log('Got type:', type);

				data = {
					codec: type //'video/mp4; codecs="avc1.42001e, mp4a.40.2"'
				};

				linkup.submit('stream', data, sockstream);
			});

			conv_options = {

				// Make encoding realtime
				realtime: true,

				// Use mp4 profile
				profile: 'mp4'
			};

			// If the source is an mjpeg stream,
			// make sure ffmpeg knows it's a variable framerate thing
			if (record.settings.media_type == 'mjpeg') {
				conv_options.variable_framerate = true;
				conv_options.extra_args = ['-vsync', '2'];
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