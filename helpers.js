var $ = require('jquery');
var bcrypt = require('bcrypt');
var async = require('async');

module.exports = function (elric) {
	
	/**
	 * A function to extend functions, lifted from Doek
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.31
	 */
	elric.extend = function (parent, constructor) {
		var intermediateConstructor = constructor;
		
		for(var i in parent.prototype) {
			intermediateConstructor.prototype[i] = parent.prototype[i];                  
		}
		
		return intermediateConstructor;
	}
	
	/**
	 * Get / create a directory
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.13
	 * @version  2013.01.13
	 *
	 * @param    {string}   path          The path we want to create
	 * @param    {object}   appenddate    The date object, if we want to add time dirs
	 * @param    {function} callback
	 */
	elric.getDirectory = function (path, appenddate, callback) {

		var timedir = '';
		var basedir = '';
		
		if (appenddate) {
			
			var eD = appenddate;
			
			// Get a padded month
			var month = String('00'+(eD.getMonth()+1)).slice(-2);
		
			// Construct the time portion of the directory
			timedir = eD.getFullYear() + '/' + month + '-' + eD.getDate();
		}
		
		// If the path is absolute, do not prepend the local storage path
		if (path.charAt(0) != '/') {
			basedir = elric.local.storage + '/';
		}
		
		basedir += path + '/' + timedir + '/';
		
		basedir = basedir.replace(/\/\//g,'/').replace(/\/\//g,'/');
		
		// If the dir hasn't been stored in our temp object, check it
		if (elric.temp.dirs[basedir] === undefined) {
		
			elric.tools.mkdirp(basedir, function (err) {
				if (callback) {
					if (err) {
						callback(err, false);
					} else {
						callback(false, basedir);
					}
				}
				
				if (!err) elric.temp.dirs[basedir] = true;
			});
		} else {
			
			// We've already created it, call the callback directly
			if (callback) callback(false, basedir);
		}
	}
	
	/**
	 * Move 2 files
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.13
	 * @version  2013.01.13
	 *
	 * @param    {object}   source        The source object
	 * @param    {object}   destination   The destination object
	 * @param    {function} callback
	 */
	elric.moveFile = function moveFile (source, destination, callback) {
		
		/**
		 * File packet structure:
		 * type: base64 = ready for decoding
		 *       path = ready for encoding or moving
		 *       client = send command to client first!
		 *       server
		 * data: the base64 string
		 * path: the path, if it exists
		 * socket: destination or source socket
		 */
		
		if (source.type == 'base64') {
			if (destination.type == 'path') {
				// Decode the base64 data to the destination
				elric.tools.base64.decode(source.data, destination.path, function (err) {
					
					if (err) elric.log.error('File could not be saved to ' + destination.path);
					
					if (callback) callback(err);
				});
			}
		} else if (source.type == 'path') {
			
			// Send a source file to a destination socket by base64 encoding it
			if (destination.type == 'base64') {
				elric.tools.base64.encode(source.path, function (err, base64string) {
					
					if (err) {
						elric.log.error('Error encoding ' + source.path + ' to base64 string');
					} else if (destination.socket) {
						destination.socket.emit('moveFile', base64string, destination.path);
					}
					
					if (callback) callback(err);
				});
			}
		} else if (source.type == 'client') {
			
			// Send a request to the client first for the move
			if (source.socket) {
			
				// Store the callback in a temporary variable
				if (destination.id === undefined && callback) {
					destination.id = elric.randomstring();
					elric.movecallbacks[destination.id] = callback;
				}
				
				source.socket.emit('requestFile', source.path, destination);
			} else {
				if (callback) callback({error: 'No source socket'});
			}
		}
	}
	
	/**
	 * Initiate a file transfer from a client to the server
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.13
	 * @version  2013.01.13
	 *
	 * @param    {object}    clientsocket    The socket of the client
	 * @param    {string}    sourcepath      The path on the client
	 * @param    {string}    destination     The path on the server
	 * @param    {function}  callback
	 */
	elric.moveFromClient = function moveFromClient (clientsocket,
																									sourcepath,
																									destination,
																									callback) {
		
		elric.moveFile({type: 'client', path: sourcepath, socket: clientsocket},
									 {type: 'server', path: destination},
									 callback);
		
	}
	
	
	/**
	 * Get a namespace event emitter
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.09
	 * @version  2013.01.09
	 *
	 * @param    {string}   filter      The filter name
	 * @returns  {EventEmitter}   An event emitter
	 */
	elric.getEventspace = function getEventspace (filter) {
		
		if (elric.websocket.filter[filter] === undefined) {
			elric.websocket.filter[filter] = new elric.classes.EventEmitter(); 
		}
		
		return elric.websocket.filter[filter];
	}
	
	/**
	 * Save a database record
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.07
	 * @version  2013.01.07
	 *
	 * @param    {object}   item            The mongoose item
	 * @param    {object}   res             The resource to send errors to
	 * @param    {function} callback        The function to callback
	 * @param    {string}   reportError     If applicable, send an error response
	 * @param    {string}   reportSuccess   If applicable, send a success response
	 */
	elric.saveRecord = function saveRecord (item,
																			res,
																			callback,
																			reportError,
																			reportSuccess) {
		
		if (reportError === undefined || reportError === true) {
			reportError = 'Saving record failed';
		}
		
		if (reportSuccess === undefined || reportSuccess === true) {
			reportSuccess = 'Record has been saved';
		}
		
		// Save the item
		item.save(function (err) {
			
			// If an error has been found ...
			if (err) {
				
				// Send it to the client if reportError is set
				// and we've been given a response object
				if (reportError && res) {
					res.send({
						success: false,
						error: {
							errors: err,
							message: reportError
							}
						});
				}
			} else {
				
				// Send a success message to the client if reportSuccess
				// is set and we've been given a response object
				if (reportSuccess && res) {
					res.send({
						success: {
							message: reportSuccess
							},
						error: false
					});
				}
			}
			
			// Make the callback
			if (callback) callback(err);
		});
	}
	
	/**
	 * Make a variable available in the browser
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.06
	 *
	 * @param    {string}   name    Variable name (inside browser's Elric namespace)
	 * @param    {object}   object  The object to send to the browser
	 * @param    {object}   res     Optional: only send it once
	 */
	elric.expose = function expose (name, object, res) {
		
		if (res === undefined) {
			elric.exposedObjects[name] = {name: name, object: object};
		} else {
			if (res.locals.exposedObjects === undefined) res.locals.exposedObjects = {};
			res.locals.exposedObjects[name] = {name: name, object: object};
		}
	}
	
	/**
	 * Create a notification
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.05
	 *
	 */
	elric.notify = function notify (message, level, origin, payload, destination) {
		
		// Also send the message to the logger
		elric.log.info('Notification: ' + message);
		
		var n = elric.models.notification.model;
		
		var notification = {
			message: message,
			level: 'info',
			origin: 'main',
			payload: false,
			destination: 'wide'}
		
		if (level !== undefined) notification.level = level;
		if (origin !== undefined) notification.origin = origin;
		if (payload !== undefined) notification.payload = payload;
		if (destination !== undefined) notification.destination = destination;
		
		var newrecord = new n(notification);
		
		elric.submitAllBrowsers('notify', notification);
		
		newrecord.save();
	}
	
	/**
	 * Create a new Mongoose schema, with certain fields auto created
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.05
	 * @version  2013.01.13
	 *
	 * @param    {object}   blueprint   The schema blueprint
	 * 
	 * @returns  {object}   A mongoose schema
	 */
	elric.Schema = function Schema (blueprint) {
		
		// Add the created & updated field
		// Created is strictly speaking not needed (_id)
		blueprint.created = {type: Date, default: Date.now, fieldType: 'Date'}
		blueprint.updated = {type: Date, default: Date.now, fieldType: 'Date'}
		
		// Create a blueprint clone, one we can edit
		var blueprintClone = $.extend({}, blueprint);
		
		// Create an object to store the temporary schemas in
		var tempSchemas = {};
		
		// See if any of the entries are arrays
		for (var fieldname in blueprintClone) {
			var e = blueprintClone[fieldname];
			
			if (e.array) {
				var ns = {};
				ns[fieldname] = {};
				
				// Now go over every entry in this field
				for (var option in e) {
	
					// Add those options to a temporary blueprint,
					// but only if it's not the array option
					if (option !== 'array'){
						ns[fieldname][option] = e[option];
					}
				}
				
				// Create the temporary array out of the temporary blueprint
				tempSchemas[fieldname] = elric.mongoose.Schema(ns);
				
				// Overwrite the entry in the clone
				blueprintClone[fieldname] = [tempSchemas[fieldname]];
			}
		}
		console.log(blueprintClone);
		var schema = elric.mongoose.Schema(blueprintClone);
		
		// Set the "updated" field to this timestamp before saving
		schema.pre('save', function(next){
			this.updated = Date.now();
			next();
		});
		
		return schema;
	}
	
	elric.redirectLogin = function redirectLogin (res, req) {
		if (!elric.isFirstRun && req.originalUrl != '/login') {
			req.session.destination = req.originalUrl;
			res.redirect('/login');
			return true;
		} else {
			return false;
		}
	}
	
	/**
	 * Check a user's password
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.27
	 * @version  2013.01.06
	 */
	elric.checkPassword = function checkPassword (req, res, password, user) {
		// See if password matches
		var passMatch = bcrypt.compareSync(password, user.password);
		
		if (passMatch) {
			req.session.user = user;
			req.session.username = user.username;
			
			//var d = new Date;
			var hours = 3600000;
			var days = 24*hours;
			
			res.cookie('pass', password, { maxAge: 14*days, httpOnly: true });
			res.cookie('user', user.username, { maxAge: 14*days, httpOnly: true });
			
			// Set the random string for socket.io connection
			if (elric.activeUsers[user.username] === undefined) {
				elric.activeUsers[user.username] = {
					key: elric.randomstring(),
				  socket: false};
			}
			
			return true;
		} else {
			return false;
		}
	}
	
	/**
	 * Load a new plugin
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.27
	 * @version  2013.01.09
	 */
	elric.loadPlugin = function loadPlugin (pluginName) {
		
		elric.log.debug('Initializing Plugin "' + pluginName + '"');
		
		var filepath = './plugins/' + pluginName + '/' + pluginName + 'Plugin';
		
		try {
			var plugin = require(filepath);
		} catch (err) {
			elric.log.error('Error loading file: "' + filepath + '"');
		}
		
		try {
			elric.plugins[pluginName] = new plugin(elric);
		} catch (err) {
			elric.log.error('Error initializing plugin "' + pluginName + '": ' + err.message);
		}
	}
	
	/**
	 * Load a new model
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.27
	 * @version  2013.01.11
	 */
	elric.loadModel = function loadModel (modelName, pluginName) {
		
		var path = 'models/' + modelName + 'Model';
		var debugm = '';
		
		if (pluginName !== undefined) {
			path = 'plugins/' + pluginName + '/' + path;
			debugm = ' from Plugin "' + pluginName + '"';
		}
		
		path = './' + path;
		
		elric.log.debug('Initializing Model "' + modelName + '"' + debugm);
		
		var model = require(path);
		var m = new model(elric);
		
		// Store the new model
		elric.models[modelName] = m;
		
		// Create an admin interface?
		if (m.admin) {
			elric.admin[modelName] = new elric.classes.Admin(m, $.extend(true, {name: modelName}, m.admin));
			elric.adminArray.push(elric.admin[modelName]);
		}
	}
	
	/**
	 * Load a new element type
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.31
	 * @version  2013.01.05
	 */
	elric.loadElementType = function loadElementType (typeName, pluginName) {
		
		var path = './element_types/' + typeName + 'Type';
		var debugm = '';
		
		if (pluginName !== undefined) {
			path = './plugins/' + pluginName + '/element_types/' + typeName + 'Type';
			debugm = ' from Plugin "' + pluginName + '"';
		}
		
		elric.log.debug('Initializing elementType "' + typeName + '"' + debugm);
		
		var constructor = require(path);
		
		var et = elric.extend(elric.classes.BaseElementType, constructor);
		
		et = new et(elric);
		
		// Store the new type
		elric.elementTypes[typeName] = et;
	}
	
	/**
	 * Load a new capability
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.06
	 * @version  2013.01.06
	 */
	elric.loadCapability = function loadCapability (capabilityName, pluginName) {
		
		var path = './capabilities/' + capabilityName + 'Capability';
		var debugm = '';
		
		if (pluginName !== undefined) {
			path = './plugins/' + pluginName + '/capabilities/' + capabilityName + 'Capability';
			debugm = ' from Plugin "' + pluginName + '"';
		}
		
		elric.log.debug('Initializing Capability "' + capabilityName + '"' + debugm);
		
		var constructor = require(path);
		
		var capability = elric.extend(elric.classes.BaseCapability, constructor);
		
		capability = new capability(elric);
		
		// Store the new type
		elric.capabilities[capabilityName] = capability;
	}
	
	/**
	 * Turn an object into an array
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.06
	 * @version  2013.01.06
	 *
	 * @param    {object}   object   The object to turn into an array
	 *
	 * @returns  {array}             The converted array
	 */
	elric.makeArray = function makeArray (object) {
		
		var returnArray = [];
		
		for (var i in object) {
			returnArray.push(object[i]);
		}
		
		return returnArray;
	}
	
	/**
	 * Turn an array into an object
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.06
	 * @version  2013.01.06
	 *
	 * @param    {array}   array     The array to turn into an object
	 * @param    {string}  keyname   The key inside the objects to use
	 *
	 * @returns  {array}             The converted array
	 */
	elric.makeObject = function makeObject (array, keyname) {
		
		var obj = {};
		
		for (var i in array) {
			if (array[i][keyname] !== undefined) {
				obj[array[i][keyname]] = array[i];
			}
		}
		
		return obj;
	}
	
	/**
	 * Our wrapper function for a template render,
	 * adds some basic information
	 *
	 * @param   {object}   req
	 * @param   {object}   res
	 * @param   {object}   view
	 * @param   {object}   options
	 */
	elric.render = function render (req, res, view, options) {
		
		if (options === undefined) options = {}
		
		var iokey = false;
		var objects = {};
		var robj = {};
		
		if (elric.activeUsers[req.session.username] !== undefined) {
			iokey = elric.activeUsers[req.session.username].key;
			objects = elric.exposedObjects;
			
			elric.expose('iokey', iokey, res);
			elric.expose('username', req.session.username, res);
		}
		
		if (res.locals.exposedObjects !== undefined) robj = res.locals.exposedObjects;
		
		res.render(view,
							 $.extend(true,
												{dest: req.originalUrl,
												username: req.session.username,
												notifications: res.locals.notifications,
												iokey: iokey,
												exposedObjects: $.extend({}, objects, robj)},
												options));
	}
	
	/**
	 * Our wrapper function for setting a route
	 *
	 * @param   {string}   path   The url
	 * @param   {array}    menu   To what menus we should add this route
	 * @param   {object}   callback   The callback function
	 * @param   {string}   methid     What method to use, default = get
	 */
	elric.addRoute = function addRoute (path, menu, title, callback, method) {
		
		if (method === undefined) method = 'get';
		
		elric.app[method](path, callback);
		
		for (var i in menu) {
			if (elric.menus[menu[i]] === undefined) elric.menus[menu[i]] = []
			elric.menus[menu[i]].push({href: path, title: title});
		}
	}
}