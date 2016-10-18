var libpath = alchemy.use('path'),
    fs = alchemy.use('fs');

/**
 * The Soundpack Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Soundpack = Model.extend(function SoundpackModel(options) {
	SoundpackModel.super.call(this, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Soundpack.constitute(function addFields() {

	// The name of this soundpack
	this.addField('name', 'String');

	// The title of this soundpack
	this.addField('title', 'String');

	// The description
	this.addField('description', 'String');
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Soundpack.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('name');
	list.addField('title');
	list.addField('description');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('name');
	edit.addField('title');
	edit.addField('description');
});

/**
 * Look for new soundpacks and soundbites
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Soundpack.setMethod(function refresh(callback) {

	var that = this,
	    sound_path = libpath.resolve(PATH_ROOT, 'soundbites');

	if (!callback) {
		callback = Function.thrower;
	}

	// Read the soundbites directory
	fs.readdir(sound_path, function gotSoundbitesDir(err, result) {

		var tasks;

		if (err) {
			return callback(err);
		}

		tasks = [];

		result.forEach(function eachDir(name) {
			tasks.push(function doPack(next) {
				that.refreshPack(name, function refreshed(err) {
					// Ignore errors on boot
					next();
				});
			});
		});

		Function.parallel(tasks, callback);
	});
});

/**
 * Refresh a certain pack
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Soundpack.setMethod(function refreshPack(name, force_bites, callback) {

	var that = this,
	    dirpath = libpath.resolve(PATH_ROOT, 'soundbites', name),
	    data;

	if (typeof force_bites == 'function') {
		callback = force_bites;
		force_bites = false;
	}

	Function.series(function getJson(next) {
		fs.readFile(libpath.resolve(dirpath, 'soundbites.json'), function gotJson(err, serialized) {

			if (!err) {
				data = JSON.parse(serialized);
			}

			next();
		});
	}, function getFiles(next) {
		// @TODO: when data is empty, get files

		if (!data) {
			data = {};
		}

		next();
	}, function done(err) {

		if (err) {
			return callback(err);
		}

		that.find('first', {conditions: {name: name}}, function gotPack(err, record) {

			var new_data;

			if (err) {
				return callback(err);
			}

			if (record.length) {
				return gotPackRecord(record);
			}

			new_data = {
				name        : name,
				title       : data.title || name.titleize(),
				description : data.description || '',
				version     : data.version
			};

			that.save(new_data, function saved(err, record) {

				if (err) {
					return callback(err);
				}

				gotPackRecord(record, true);
			});
		});
	});

	// Function to handle the pack record
	function gotPackRecord(record, is_new) {

		var Soundbite = Model.get('Soundbite'),
		    tasks = [];

		if (!data.files) {
			return callback(null);
		}

		// Don't update all the soundbites if this isn't a new pack, and it isn't forced
		if (!is_new && !force_bites) {
			return callback(null);
		}

		console.log('Got record:', record);

		Object.each(data.files, function eachFile(entry, filename) {

			tasks.push(function getBite(next) {

				var conditions = {
					soundpack_id: record._id,
					filename: filename
				};

				Soundbite.find('first', {conditions}, function gotBite(err, soundbite) {

					var new_data,
					    line,
					    i;

					if (err) {
						return next(err);
					}

					if (soundbite.length && soundbite.transcript) {
						return next();
					}

					new_data = {
						soundpack_id : record._id,
						filename     : filename,
						confidence   : null,
						transcript   : '',
						adjusted     : entry.adjusted
					};

					if (soundbite.length) {
						new_data._id = soundbite._id;
					}

					for (i = 0; i < entry.lines.length; i++) {
						line = entry.lines[i];

						// Add a space if this isn't the first sentence
						if (new_data.transcript) new_data.transcript += ' ';

						// Add this transcript line
						new_data.transcript += line.transcript.trim() + '.';

						// Adjust the confidence, use the lowest one.
						if (new_data.confidence == null || line.confidence < new_data.confidence) {
							new_data.confidence = line.confidence;
						}
					}

					Soundbite.save(new_data, function savedData(err) {

						if (err) {
							return next(err);
						}

						next();
					});
				});
			});
		});

		Function.parallel(4, tasks, function savedBites(err) {

			if (err) {
				log.error('Error refreshing "' + name + '" soundpack');
				return callback(err);
			}

			log.info('Saved ' + tasks.length + ' soundbites for the "' + name + '" pack');
			callback(null);
		});
	}
});

/**
 * Update soundpack info on boot
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
alchemy.ready(function onReady() {

	var Soundpack = Model.get('Soundpack');

	Soundpack.refresh();
});