var MediaConversion = alchemy.use('mediaconversion'),
    libpath = alchemy.use('path'),
    fs = alchemy.use('fs');

/**
 * The Soundbite Chimera Controller class
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Soundbite = Function.inherits('Alchemy.ChimeraController', function SoundbiteChimeraController(conduit, options) {
	SoundbiteChimeraController.super.call(this, conduit, options);

	this.addComponent('paginate');
});

/**
 * Show all soundpacks
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Soundbite.setMethod(function index(conduit) {

	var that = this;

	this.set('pagetitle', 'Soundbite packs');

	this.getModel('Soundpack').find('all', {recursive: 0}, function gotPacks(err, records) {

		if (err) {
			return that.error(err);
		}

		that.set('records', records);

		that.render('soundbite/chimera_pack_index');
	});
});

/**
 * Show all soundbites
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Soundbite.setMethod(function bite_index(conduit) {

	var that = this,
	    Soundbite = this.getModel('Soundbite'),
	    options;

	this.set('pagetitle', 'Soundbites');

	options = {
		pageSize: 20,
		conditions: {
			soundpack_id: conduit.param('id')
		}
	};

	this.components.paginate.find(Soundbite, options, function gotBites(err, bites) {

		if (err) {
			return conduit.error(err);
		}

		console.log('Bites:', bites);

		that.set('records', bites);
		that.render('soundbite/chimera_bite_index');
	});
});

/**
 * Get tags of a soundbite
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Soundbite.setMethod(function bite_record(conduit) {

	var that = this,
	    Soundbite = this.getModel('Soundbite'),
	    options;

	options = {
		recursive: 0,
		conditions: {
			_id: conduit.param('id')
		}
	};

	Soundbite.find('first', options, function gotRecord(err, record) {

		if (err) {
			return conduit.error(err);
		}

		if (!record.length) {
			return conduit.end({});
		}

		if (conduit.method == 'post') {

			record.update(conduit.body.data, function updated(err) {

				if (err) {
					return conduit.error(err);
				}

				conduit.end({success: true});
			});

			return;
		}

		return conduit.end(record.Soundbite);
	});
});

/**
 * Play a soundbite
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Conduit}   conduit
 */
Soundbite.setMethod(function audiofile(conduit) {

	var that = this,
	    Soundbite = this.getModel('Soundbite'),
	    options;

	options = {
		recursive: 1,
		conditions: {
			_id: conduit.param('id')
		}
	};

	Soundbite.find('first', options, function gotRecord(err, record) {

		var path;

		if (err) {
			return conduit.error(err);
		}

		path = libpath.resolve(PATH_ROOT, 'soundbites', record.Soundpack.name, record.filename);

		conv = new MediaConversion();

		console.log('Conversion:', conv);
		console.log('Got record:', record);
		console.log('File path:', path);

		conv.setInput(path);

		conv.start(conduit.response, {profile: 'mp3', realtime: true, probe: false});
	});
});

// Add the dashboard to the menu deck
alchemy.plugins.chimera.menu.set('soundbites', {
	title: 'Soundbites',
	route: 'chimera@ActionLink',
	parameters: {
		controller: 'Soundbite',
		action: 'index'
	},
	icon: {svg: 'sound-bars-pulse'}
});