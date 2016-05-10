var MediaConversion = alchemy.use('mediaconversion'),
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
	schema = new alchemy.classes.Schema(this);
	this.schema = schema;
});

/**
 * This is a wrapper class
 */
CameraType.setProperty('extend_only', true);

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
	    cached;

	if (stream_cache[this.id]) {
		return callback(null, stream_cache[this.id]);
	}

	Function.series(false, function getCache(next) {

		// If a stream multiplier already exists,
		// create a new fork and pause it
		if (stream_cache[id]) {
			cached = stream_cache[id];

			// If the multiplier is still active, use that
			if (!cached.destroyed) {
				return next();
			}
		}

		// Cache not found, or destroyed, get a new stream
		that.getRawStream(function gotRawStream(err, stream) {

			if (err) {
				return callback(err);
			}

			cached = new alchemy.classes.Develry.StreamMultiplier(stream);
			stream_cache[id] = cached;

			next();
		});
	}, function done(err) {

		if (err) {
			return callback(err);
		}

		callback(null, cached.createStream());
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