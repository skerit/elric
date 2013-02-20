var $ = require('jquery');
var bcrypt = require('bcrypt');
var async = require('async');
var fs = require('fs');
var mainDir = process.cwd();
var scp = require('scp');

module.exports = function (elric) {
	
	/**
	 * A function to extend functions, lifted from Doek
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.31
	 * @version  2013.02.02
	 *
	 * @param   {object}    parent        The parent class
	 * @param   {function}  constructor   A constructor
	 * @param   {function}  constructor2  Another constructor ...
	 */
	elric.extend = function (parent, constructor) {

		// The actual constructor will loop over an array of constructors
		var intermediateConstructor = function() {
			for (var i in this._constructors) {
				this._constructors[i].apply(this, arguments);
			}
		}
		
		// Prepare an array for all our constructors
		intermediateConstructor.prototype._constructors = [];
		
		// Add the constructors to that array
		for (var i = 1; i < arguments.length; i++) {
			
			// Make sure the argument is actually defined
			if (arguments[i] !== undefined) {
				
				intermediateConstructor.prototype._constructors.push(arguments[i]);
				
				// Add the prototypes of these constructors
				for (var j in arguments[i].prototype) {
					intermediateConstructor.prototype[j] = arguments[i].prototype[j];
				}
			}
		}
		
		for(var i in parent.prototype) {
			intermediateConstructor.prototype[i] = parent.prototype[i];
		}

		return intermediateConstructor;
	}
	
	/**
	 * Get the public url for a file in storage
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.16
	 * @version  2013.01.17
	 *
	 * @param    {string}   path   The absolute path to the file
	 * @returns  {string}          The public url
	 */
	elric.getStorageUrl = function getStorageUrl (path) {
		
		/**
		 * @todo Return an "image not found" image if the path is invalid
		 */
		var newpath = false;
		
		if (path) {
			newpath = path.replace(elric.local.storage, '/storage/');
		}
		
		return newpath;
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

		var timedir = false;
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
		
		if (timedir) {
			basedir += path + '/' + timedir + '/';
		} else {
			basedir += path + '/';
		}
		
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
	 * @version  2013.02.09
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
					destination.callbackid = destination.id;
					elric.movecallbacks[destination.id] = callback;
				}
				
				source.socket.emit('requestFile', source.path, destination);
			} else {
				if (callback) callback({error: 'No source socket'});
			}
		}
	}
	
	/**
	 * Create a client object for every client, even unconnected.
	 * Skip already created clients.
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.15
	 * @version  2013.02.10
	 */
	elric.prepareForClients = function prepareForClients () {
		
		var C = elric.models.client.model;
		
		C.find({}, function (err, clients) {
			
			for (var i in clients) {
				
				var client = clients[i];
				
				// Only create the object if it doesn't already exist!
				if (elric.clients[client._id] === undefined) {
					
					var instructions = {
						id: client._id,
						key: client.key,
						name: client.hostname,
						ip: client.ip
					};
					
					// Create the new object
					var co = new elric.classes.ElricClient(instructions);
					
					// Store it in the clients object
					elric.clients[client._id] = co;
					
				}
			}
			
			// Tell event listeners the clients have been prepared
			elric.events.all.emit('clientsprepared');
			
		});
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
	 * @param    2013.02.04
	 *
	 * @param    {string}   name    Variable name (inside browser's Elric namespace)
	 * @param    {object}   object  The object to send to the browser
	 * @param    {object}   res     Optional: only send it once
	 */
	elric.expose = function expose (name, object, res) {
		
		if (res === undefined) {
			elric.exposedObjects[name] = object;
		} else {
			if (res.locals.exposedObjects === undefined) res.locals.exposedObjects = {};
			res.locals.exposedObjects[name] = object;
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
	 * Add code to a response object the client browser needs to execute
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.04
	 * @version  2013.02.04
	 *
	 * @param   {object}   res        The response object
	 * @param   {object}   options    Containing id, path or code and destination
	 */
	elric.resCode = function resCode (res, options) {
		
		var path = false;
		var code = false;
		var destination = 'anywhere';
		
		if (options.code) {
			code = options.code;
		} else {
			path = options.path;
		}
		
		if (options.destination) destination = options.destination;

		res.locals.hawkejs.clientcode[options.id] = {
			type: 'script',
			path: path,
			code: code,
			destination: destination
		};
	}
	
	/**
	 * Our wrapper function for a template render,
	 * adds some basic information
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.31
	 * @version  2013.02.03
	 *
	 * @param   {object}   req
	 * @param   {object}   res
	 * @param   {object}   view
	 * @param   {object}   options
	 */
	elric.render = function render (req, res, view, options) {
		
		if (options === undefined) options = {};

		// The websocket key
		var iokey = false;
		
		// Objects to expose to any client all the time
		var exposeObjects = {};
		
		// Objects to expose to the client for this request
		var exposeRequest = {};
		
		// Create the render payload
		var payload = {};
		
		// Some things don't need to be sent when it's an ajax request
		// because these variables shouldn't change
		if (!req.xhr) {
			
			// If the user has an active session ...
			if (elric.activeUsers[req.session.username] !== undefined) {
				
				iokey = elric.activeUsers[req.session.username].key;
				exposeObjects = elric.exposedObjects;
				
				elric.expose('iokey', iokey, res);
				elric.expose('username', req.session.username, res);
			}
		}
		
		elric.expose('notifications', res.locals.notifications, res);
		
		// Get objects we have to expose for this request only
		if (res.locals.exposedObjects !== undefined) {
			exposeRequest = res.locals.exposedObjects;
		}
		
		// Tell hawkejs to expose these objects
		var xo = elric.inject({}, exposeObjects, exposeRequest);
		elric.resCode(res,
			{id: 'scriptexpose',
			 code: 'jQuery.extend(Elric.exposed, ' + JSON.stringify(xo) + ');'}
		);
		
		payload.menus = elric.clone({}, elric.menus);
		payload.iokey = iokey;
		payload.notifications = res.locals.notifications;
		
		elric.inject(payload, options);
		
		if (!payload.username) {
			payload.username = req.session.username ? req.session.username : 'NOT SET';
		}
		
		// Render the wanted view
		res.render(view, payload);
	}
	
	/**
	 * Our wrapper function for setting a route
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.31
	 * @version  2013.02.01
	 *
	 * @param   {string}   path       The url
	 * @param   {array}    menus      To what menus we should add this route
	 * @param   {object}   callback   The callback function
	 * @param   {string}   method     What method to use, default = get
	 */
	elric.addRoute = function addRoute (path, menus, title, callback, method) {
		
		if (method === undefined) method = 'get';
		
		elric.app[method](path, callback);
		
		for (var i in menus) {
			
			var opt = menus[i];
			
			if (typeof opt == 'string') opt = {menu: opt};
			
			// Make sure the target menu exists
			if (elric.menus[opt.menu] === undefined) elric.menus[opt.menu] = [];
			
			var linkOptions = {title: title};
			
			if (opt.icon) linkOptions.icon = opt.icon;
			
			// Push this entry
			elric.menus[opt.menu].push({href: path, options: linkOptions});
		}
	}
	
	/**
	 * Edit a block
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.19
	 * @version  2013.02.20
	 */
	elric.editFlow = function editFlow(req, res, flow) {
		
		var flowid = flow._id;

		var activities = {};
		var actions = {};
		var flow_blocks = {};
		
		// Get all the flow blocks
		for (var i in elric.models.flowBlock.cache) {
			
			var fb = elric.models.flowBlock.cache[i];

			if (fb.flow_id.toString() == flowid) {
				flow_blocks[fb._id] = fb;
			}
		}

		// Normalize the activities
		for (var activity_name in elric.activities) {
			var a = elric.activities[activity_name];

			activities[activity_name] = {
				name: a.name,
				title: a.title,
				plugin: a.plugin,
				categories: a.categories,
				ongoing: a.ongoing,
				new: a.new,
				payload: a.payload,
				blueprint: a.blueprint,
				origin: a.origin
			};
		}
		
		// Normalize the actions
		for (var action_name in elric.actions) {
			var a = elric.memobjects.actions[action_name];
			
			actions[action_name] = {
				name: a.name,
				title: a.title,
				description: a.description,
				activity_trigger: a.activity_trigger
			};
		}

		elric.expose('flow_activities', activities, res);
		elric.expose('flow_actions', actions, res);
		elric.expose('flow_flow', flow, res);
		elric.expose('flow_blocks', flow_blocks, res);

		elric.render(req, res, 'flows/edit', {flow_name: flow.name, activities: activities, actions: actions});
	}
	
	/**
	 * Save a (new) flow block
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.18
	 * @version  2013.02.20
	 *
	 * @param    {string}   name       The name of the flow
	 * @param    {object}   flow
	 * @param    {object}   blocks
	 * @param    {string}   user_id
	 * @param    {object}   req
	 */
	elric.saveFlow = function saveFlow (name, flow, blocks, user_id, req) {
		
		if (name && name != 'false') flow.name = name;
		
		// Now modify all the links with this new id
		for (var i in blocks) {
			
			var block = blocks[i];
			var record = elric.models.flowBlock.cache[block.id];
			
			record.top = block.top;
			record.left = block.left;
			record.out_on_true = [];
			record.out_on_false = [];
			
			for (var connection_type in block.to_connections) {
				var connections = block.to_connections[connection_type];
				
				for (var to_id in connections) {
					record['out_on_' + connection_type].push(to_id);
				}
			}
			
			record.save();
		}
		
		flow.save();
	}
	
	/**
	 * Fire an activity
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.14
	 * @version  2013.02.18
	 *
	 * @param   {string}   activity_name   The activity name
	 */
	elric.fireActivity = function fireActivity (activity_name, options) {
		
		// Do nothing if the activity doesn't exist
		if (typeof elric.activities[activity_name] == 'undefined') return false;
		
		var activity = elric.activities[activity_name];
		
		var new_activity = activity.create(options);
		
		activity.fire(new_activity);
		
		return new_activity;
	}
	
	/**
	 * Copyright Andrée Hansson, 2010
   * Use it however you want, attribution would be nice though.
   * Website:        http://andreehansson.se/
	 * GMail/Twitter:  peolanha
	 *
	 * update 4: Leonardo Dutra, http://twitter.com/leodutra
	 *
	 * @author   Andrée Hansson
	 * @since    2010
	 *
	 * @param   {object}   superObj
	 * @param   {object}   extension
	 *
	 * @returns {object}   A deeply cloned version of the extension object
	 */
  elric.clone = function(superObj, extension) {
		
		if (superObj && extension) {
			
			var deep = function() {}; // prepare sword
			
			deep.prototype = superObj; // hold it
			
			superObj = new deep; // pull it
			
			return (deep = function(o, ext) { // concentrate
				var k;
				
				for (k in ext) {
					o[k] = typeof ext[k] === 'object' && ext[k] ? deep({}, ext[k]) : ext[k];
				}
				
				return o;
			})(superObj, extension); // push it deep, slicing
		}
		
		return null;
  }
	
	/**
	 * Inject the properties of one object into another target object
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.03
	 * @version  2013.02.03
	 *
	 * @param   {object}   target     The object to inject the extension into
	 * @param   {object}   extension  The object to inject
	 *
	 * @returns {object}   Returns the injected target (which it also modifies byref)
	 */
	elric.inject = function inject (target, first, second) {
		
		var length = arguments.length;
		
		// Go over every argument, other than the first
		for (var i = 1; i <= length; i++) {
			var extension = arguments[i];
			
			// Go over every property of the current object
			for (var i in extension) {
				target[i] = extension[i];
			}
		}
		
		return target;
	}
	
}