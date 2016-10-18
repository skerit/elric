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

	var camera_types = alchemy.getClassGroup('elric_camera_type');

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
	    hinder,
	    cached;

	if (!callback) {
		callback = Function.thrower;
	}

	// If the cached stream has been destroyed, create a new one
	if (stream_cache[id] && stream_cache[id].stream && stream_cache[id].stream.destroyed) {
		stream_cache[id] = null;
	}

	if (!stream_cache[id]) {
		hinder = Function.hinder(function createHinderedStream(done) {

			// Get the actual stream
			that.camera.getStream(function gotStream(err, stream) {

				if (err) {
					// @TODO: fix this shit with the errors and the hinders
					stream_cache[id] = null;
					return done(err);
				}

				hinder.stream = new Classes.Develry.StreamMultiplier(stream, 'NormalizedCamera');

				done(null);
			});
		});

		stream_cache[id] = hinder;
	} else {
		hinder = stream_cache[id];
	}

	// Wait for a single stream to return
	hinder.push(function createFork(err) {

		if (err) {
			// @TODO: fix this shit with the errors and the hinders
			stream_cache[id] = null;

			return callback(err);
		}

		return callback(null, hinder.stream.createStream());
	});
});
