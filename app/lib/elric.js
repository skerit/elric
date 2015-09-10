/**
 * The Elric Singleton class
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.2.0
 * @version  0.2.0
 */
var Elric = Function.inherits('Informer', function Elric() {

	// Only allow 1 elric instance
	if (global.elric) {
		return global.elric;
	}

	this.clients = [];

	// Load all the clients
	this.init();
});

Elric.setMethod(function init() {

	var that = this;

	// Only init once
	if (global.elric) {
		return;
	}

	alchemy.sputnik.beforeSerial('startServer', function initElric(done) {

		// Wait for model compositions and such
		Blast.loaded(function() {
			that.initClientList(done);
			done();
		})
	});
});

/**
 * Load all the clients from the database
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Elric.setMethod(function initClientList(callback) {

	var that = this;

	Model.get('Client').find('all', function gotAllClients(err, result) {

		result.forEach(function eachClientDocument(client) {
			that.clients.push(client);
		});

		that.emit('client_list');

		if (callback) {
			return callback();
		}
	});
});

/**
 * Register a client
 *
 * @author   Jelle De Loecker <jelle@kipdola.be>
 * @since    1.0.0
 * @version  1.0.0
 *
 * @param    {ElricClientSocketConduit}   eclient
 */
Elric.setMethod(function registerClient(eclient) {

	var that = this,
	    client_doc,
	    info,
	    data,
	    i;

	if (!this.hasBeenSeen('client_list')) {
		return this.after('client_list', function delay() {
			that.registerClient(eclient);
		});
	}

	info = eclient.announcement;
	log.info('Incoming client connection: ' + info.hostname);

	Function.series(function findDocument(next) {

		// Look for this hostname first
		that.clients.some(function eachClientDocument(client) {

			// If client_id is given, only match that
			if (info.client_id) {
				if (String(info.client_id) == String(client.client_id)) {
					client_doc = client;
					return true;
				}

				return false;
			}

			if (client.hostname == info.hostname) {
				client_doc = client;
				return true;
			}
		});

		next();
	}, function createNewRecord(next) {

		if (client_doc) {
			return next();
		}

		data = {
			hostname: info.hostname,
			ip: eclient.socket.conn.remoteAddress,
			enabled: false,
			key: ''
		};

		Model.get('Client').save(data, function savedClient(err, doc) {

			if (err) {
				return next(err);
			}

			client_doc = doc;

			that.clients.push(doc);
			next();

		});
	}, function done(err) {

		if (err) {
			return log.error('Error registering client ' + eclient.announcement.hostname + ': ' + err);
		}

		// Attach the conduit
		client_doc.attachConduit(eclient);
	});

});

// Create the global instance
global.elric = new Elric();