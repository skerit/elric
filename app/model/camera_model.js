var MediaConversion = alchemy.use('mediaconversion'),
    stream_cache = {};

/**
 * The Camera Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Camera = Model.extend(function CameraModel(options) {
	CameraModel.super.call(this, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Camera.constitute(function addFields() {

	var camera_types = alchemy.shared('elric.camera_type');

	this.belongsTo('Client');

	this.addField('name', 'String');
	this.addField('camera_type', 'Enum', {values: camera_types});
	this.addField('settings', 'Schema', {schema: 'camera_type'});

	// Return the camera type
	this.Document.setFieldGetter('camera', function getCamera() {
		if (camera_types[this.camera_type]) {
			return new camera_types[this.camera_type](this);
		}
	});
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Camera.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('name');
	list.addField('camera_type');
	list.addField('client_id');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('name');
	edit.addField('camera_type');
	edit.addField('client_id');
	edit.addField('settings');
});

/**
 * Get the video stream
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Camera.setDocumentMethod(function getStream(callback) {

	var that = this,
	    id = this._id,
	    cached;

	if (!callback) {
		callback = Function.thrower;
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

		that.camera.getStream(function gotStream(err, stream) {

			if (err) {
				return next(err);
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
