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
	
	elric.redirectLogin = function redirectLogin (res, req) {
		if (!elric.isFirstRun && req.originalUrl != '/login') {
			req.session.destination = req.originalUrl;
			res.redirect('/login');
			return true;
		} else {
			return false;
		}
	}
	
	elric.checkPassword = function checkPassword (req, res, password, user) {
		// See if password matches
		var passMatch = bcrypt.compareSync(password, user.password);
		
		if (passMatch) {
			req.session.user = user;
			req.session.username = user.username;
			
			res.cookie('pass', password, { maxAge: 900000, httpOnly: true });
			res.cookie('user', user.username, { maxAge: 900000, httpOnly: true });
			
			return true;
		} else {
			return false;
		}
	}
	
	elric.loadPlugin = function loadPlugin (pluginName) {
		var plugin = require('./plugins/' + pluginName + '/' + pluginName);
		elric.plugins[pluginName] = new plugin(elric);
	}
	
	elric.loadModel = function loadModel (modelName, pluginName) {
		
		var path = './models/' + modelName;
		
		if (pluginName !== undefined) {
			path = './plugins/' + pluginName + '/models/' + modelName;
		}
		
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
	 */
	elric.loadElementType = function loadElementType (typeName, pluginName) {
		
		var path = './element_types/' + typeName;
		
		if (pluginName !== undefined) {
			path = './plugins/' + pluginName + '/element_types/' + typeName;
		}
		
		var constructor = require(path);
		var et = elric.extend(elric.classes.BaseElementType, constructor)(elric);
		
		// Store the new type
		elric.types[typeName] = et;
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
		res.render(view,
							 $.extend(true,
												{dest: req.originalUrl,
												username: req.session.username},
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