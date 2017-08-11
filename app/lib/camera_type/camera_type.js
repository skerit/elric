var MediaConversion = alchemy.use('mediaconversion'),
    MotionDetect = alchemy.use('motion-detect'),
    stream_cache = {};

/**
 * The Camera Type class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var CameraType = Function.inherits('Elric.Wrapper', function CameraType(record) {

	// Store the record
	this.record = record;

	// Store the id
	this.id = record._id;

	if (record) {
		this.settings = record.settings;
	}

	if (!this.settings) {
		this.settings = {};
	}

	// Timestamp when last motion was detected
	this.last_motion_time = 0;
	this.last_motion_emit_time = 0;
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
CameraType.constitute(function setSchema() {

	var schema;

	// Create a new schema
	schema = new Classes.Alchemy.Schema(this);
	this.schema = schema;
});

/**
 * This is a wrapper class
 */
CameraType.setProperty('is_abstract_class', true);

/**
 * This wrapper class starts a new group
 */
CameraType.setProperty('starts_new_group', true);

/**
 * Return the basic record for JSON
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
CameraType.setMethod(function toJSON() {
	return {
		name: this.name,
		title: this.title,
		type_name: this.type_name
	};
});

/**
 * Get media conversion options
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @return   {Object}
 */
CameraType.setMethod(function getConversionOptions() {
	return {};
});

/**
 * Get the (cached) stream to this device
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
CameraType.setMethod(function getStream(callback) {

	var that = this,
	    id = this.id,
	    hinder;

	// If the cached stream has been destroyed, create a new one
	if (stream_cache[id] && stream_cache[id].stream && stream_cache[id].stream.destroyed) {
		stream_cache[id] = null;
	}

	if (!stream_cache[id]) {
		hinder = Function.hinder(function createHinderedStream(done) {

			// Cache not found, or destroyed, get a new stream
			that.getRawStream(function gotRawStream(err, stream) {

				if (err) {
					return done(err);
				}

				hinder.stream = new Classes.Develry.StreamMultiplier(stream, 'RawCamera');

				done();

				// TEST detecting mothin
				that.detectMotion();
			});
		});

		stream_cache[id] = hinder;
	} else {
		hinder = stream_cache[id];
	}

	// Wait for a single stream to return
	hinder.push(function createFork(err) {

		if (err) {
			return callback(err);
		}

		return callback(null, hinder.stream.createStream());
	});
});

/**
 * Get the raw stream to this device,
 * must be implemented by children
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
CameraType.setMethod(function getRawStream(callback) {
	callback(new Error('Class "' + this.constructor.name + '" has not implemented the getRawStream method'));
});

/**
 * Process a motion object
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Object}   obj
 */
CameraType.setMethod(function processMotion(obj) {

	var now = Date.now(),
	    elapsed = now - this.last_motion_time,
	    elapsed_emit = now - this.last_motion_emit_time;

	console.log('Got motion:', obj.timestamp);

	// If it has been 10 seconds since the last emitted motion event,
	// emit a new one
	if (elapsed_emit > 10000) {
		console.log('Emitting motion event');
		elric.emitEvent('motion', this.record);
		this.last_motion_emit_time = now;
	}

	this.last_motion_time = now;

	this.emit('motion', obj);
});

/**
 * Start detecting motion
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Function}   callback
 */
CameraType.setMethod(function detectMotion() {

	var that = this;

	if (this.motion_detection_activated) {
		return;
	}

	this.motion_detection_activated = true;

	// Get the raw stream
	this.getStream(function gotStream(err, stream) {

		var motionstream,
		    consumer,
		    options,
		    output,
		    conv;

		if (err) {
			that.motion_detection_activated = false;
			return callback(err);
		}

		// Force mjpeg conversion, get 3 frames per second maximum
		options = {
			video_codec : 'mjpeg',
			container   : 'mjpeg',
			extra_args  : [

				// Force max 3 frames per second
				'-r', 3,

				// Downscale the frames
				'-vf', 'scale=320:-1'
			]
		};

		conv = new MediaConversion();
		conv.setInput(stream);

		// Create output stream
		output = conv.createStream();

		conv.start(output, options);

		// Create mjpeg consumer
		consumer = conv.createMjpegExtractor();

		motionstream = new MotionDetect.Stream();

		output.pipe(consumer).pipe(motionstream);

		// Listen for motion events
		motionstream.on('data', function gotMotion(obj) {

			// Obj contains:
			// - data (buffer)
			// - time (timestamp)
			that.processMotion(obj);
		});
	});
});