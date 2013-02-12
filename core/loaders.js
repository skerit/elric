var async = require('async');
var fs = require('fs');
var mainDir = process.cwd();

/**
 * These functions are all helper functions
 * to load a certain class upon boot.
 * It does this by requiring the needed files.
 */
module.exports = function (elric) {
	
	/**
	 * Read in a hawkejs template directory, and copy them into
	 * the temporary path, where all directories are merged and
	 * the browser client can access the files, too
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.09
	 * @version  2013.02.09
	 * 
	 * @param    {string|array}    path    The source to copy from
	 */
	elric.loadTemplates = function loadTemplates (path) {
		elric.tools.hawkejs.registerPath(path);
	}

	/**
	 * Load a new plugin
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.27
	 * @version  2013.02.09
	 */
	elric.loadPlugin = function loadPlugin (pluginName) {
		
		elric.log.debug('Initializing Plugin "' + pluginName + '"');
		
		var plugindir =  mainDir + '/plugins/' + pluginName + '/';
		var filepath = plugindir + pluginName + 'Plugin';
		
		try {
			// Get the constructor, the actual plugin file
			var constructor = require(filepath);
			
			// Extend the base plugin with this constructor
			var plugin = elric.extend(elric.classes.BasePlugin,
																elric.classes.BasePlugin.prototype.preConstructor,
																constructor);

			plugin.prototype.name = pluginName;
		
		} catch (err) {
			elric.log.error('Error loading file: "' + filepath + '"');
		}
		
		try {
			
			// Create the new plugin
			elric.plugins[pluginName] = new plugin(elric);
			
			// Copy over hawkejs templates, if they exist
			elric.loadTemplates(plugindir + 'hawkejs/');
			
		} catch (err) {
			elric.log.error('Error initializing plugin "' + pluginName + '": ' + err.message);
		}
	}
	
	/**
	 * Load a new model
	 * Extends from the base model class
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.27
	 * @version  2013.02.12
	 */
	elric.loadModel = function loadModel (modelName, pluginName) {
		
		var path = 'models/' + modelName + 'Model';
		var debugm = '';
		
		if (pluginName) {
			path = 'plugins/' + pluginName + '/' + path;
			debugm = ' from Plugin "' + pluginName + '"';
		}
		
		path = mainDir + '/' + path;
		
		elric.log.debug('Initializing Model "' + modelName + '"' + debugm);
		
		// Get the constructor, the actual model file
		var constructor = require(path);
		
		// Extend the base model with this constructor
		var model = elric.extend(elric.classes.BaseModel,
		                         elric.classes.BaseModel.prototype.preConstructor,
		                         constructor);
		
		// Set the model name
		model.prototype.name = modelName;
		
		// Instantiate this new model
		var m = new model(elric);
		
		// Now run the _init function
		m._init();
		
		// Store the new model
		elric.models[modelName] = m;
		
		// Create an admin interface?
		if (m.admin) {
			var nA = new elric.classes.Admin(m, elric.clone({name: modelName}, m.admin));
			
			elric.admin[modelName] = nA;
			
			var m = {href: '/admin/' + modelName + '/index',
			         options: {
			          title: nA.title,
			          icon: nA.icon,
			          modelname: modelName
			         }};
			
			elric.adminArray.push(m);
			
		}
	}
	
	/**
	 * Load a new element type
	 * Element Types are definition of objects we put in the doek.
	 * (Eg: closet, camera, computer, tv, ...)
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.31
	 * @version  2013.02.12
	 */
	elric.loadElementType = function loadElementType (typeName, pluginName) {
		
		var path = mainDir + '/lib/element_types/' + typeName + 'Type';
		var debugm = '';
		
		if (pluginName) {
			path = mainDir + '/plugins/' + pluginName + '/lib/element_types/' + typeName + 'Type';
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
	 * @version  2013.01.30
	 */
	elric.loadCapability = function loadCapability (capabilityName, pluginName) {
		
		var path = 'lib/capabilities/' + capabilityName + 'Capability';
		var debugm = '';
		
		if (pluginName) {
			path = 'plugins/' + pluginName + '/' + path;
			debugm = ' from Plugin "' + pluginName + '"';
		}
		
		path = mainDir + '/' + path;
		
		elric.log.debug('Initializing Capability "' + capabilityName + '"' + debugm);
		
		var constructor = require(path);
		
		var capability = elric.extend(elric.classes.BaseCapability,
		                              elric.classes.BaseCapability.prototype.preConstructor,
		                              constructor,
																	elric.classes.BaseCapability.prototype.postConstructor);
		
		if (pluginName) {
			capability.prototype.plugin = pluginName;
		}
		
		capability = new capability(elric);
		
		// Store the new type
		elric.capabilities[capabilityName] = capability;
	}
	
	/**
	 * Load a client file
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.11
	 * @version  2013.02.11
	 */
	elric.loadClientFile = function loadClientFile (clientFileName, pluginName) {
		
		var path = 'lib/client_files/' + clientFileName + 'ClientFile.js';
		var debugm = '';
		
		if (pluginName) {
			path = 'plugins/' + pluginName + '/' + path;
			debugm = ' from Plugin "' + pluginName + '"';
		}
		
		path = mainDir + '/' + path;
		
		elric.log.debug('Adding Client File "' + clientFileName + '"' + debugm);
		
		// Store the new client file location
		elric.client_files[clientFileName] = {name: clientFileName, path: path};
	}
	
	/**
	 * Load a new action class
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.31
	 * @version  2013.02.12
	 *
	 * @returns    {elric.classes.Action}   An Action class
	 */
	elric.loadAction = function loadAction (actionName, pluginName) {
	
		var path = 'lib/actions/' + actionName + 'Action';
		var debugm = '';
		
		if (pluginName) {
			path = 'plugins/' + pluginName + '/' + path;
			debugm = ' from Plugin "' + pluginName + '"';
		}
		
		path = mainDir + '/' + path;
		
		elric.log.debug('Requiring Action Class "' + actionName + '"' + debugm);
		
		var constructor = require(path);
		
		var action = elric.extend(elric.classes.BaseAction,
		                            elric.classes.BaseAction.prototype.preConstructor,
		                            constructor);

		// Store the new activity class
		elric.actions[actionName] = action;
		
		return action;
	}
	
	/**
	 * Load a new activity class we can act upon
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.30
	 * @version  2013.02.12
	 *
	 * @returns    {elric.classes.Activity}   An Activity class
	 */
	elric.loadActivity = function loadActivity (activityName, pluginName) {
	
		var path = 'lib/activities/' + activityName + 'Activity';
		var debugm = '';
		
		if (pluginName) {
			path = 'plugins/' + pluginName + '/' + path;
			debugm = ' from Plugin "' + pluginName + '"';
		}
		
		path = mainDir + '/' + path;
		
		elric.log.debug('Requiring Activity Class "' + activityName + '"' + debugm);
		
		var constructor = require(path);
		
		var activity = elric.extend(elric.classes.BaseActivity,
		                            elric.classes.BaseActivity.prototype.preConstructor,
		                            constructor);

		// Store the new activity class
		elric.activities[activityName] = activity;
		
		return activity;
	}
	
	/**
	 * Load a new device category class
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.02
	 * @version  2013.02.12
	 *
	 * @returns    {elric.classes.DeviceCategory}
	 */
	elric.loadDeviceCategory = function loadDeviceCategory (deviceCategoryName, pluginName) {
	
		var path = 'lib/device_categories/' + deviceCategoryName + 'DeviceCategory';
		var debugm = '';
		
		if (pluginName) {
			path = 'plugins/' + pluginName + '/' + path;
			debugm = ' from Plugin "' + pluginName + '"';
		}
		
		path = mainDir + '/' + path;
		
		elric.log.debug('Requiring Device Category Class "' + deviceCategoryName + '"' + debugm);
		
		var constructor = require(path);
		
		var deviceCategory = elric.extend(elric.classes.BaseDeviceCategory,
		                            elric.classes.BaseDeviceCategory.prototype.preConstructor,
		                            constructor);

		elric.deviceCategories[deviceCategoryName] = new deviceCategory();
		
		return deviceCategory;
	}
	
	/**
	 * Load a new device type class
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.12
	 * @version  2013.02.12
	 *
	 * @returns    {elric.classes.DeviceType}
	 */
	elric.loadDeviceType = function loadDeviceType (deviceTypeName, pluginName) {
	
		var path = 'lib/device_types/' + deviceTypeName + 'DeviceType';
		var debugm = '';
		
		if (pluginName) {
			path = 'plugins/' + pluginName + '/' + path;
			debugm = ' from Plugin "' + pluginName + '"';
		}
		
		path = mainDir + '/' + path;
		
		elric.log.debug('Requiring Device Type Class "' + deviceTypeName + '"' + debugm);
		
		var constructor = require(path);
		
		var deviceType = elric.extend(elric.classes.BaseDeviceType,
		                            elric.classes.BaseDeviceType.prototype.preConstructor,
		                            constructor);

		elric.deviceTypes[deviceTypeName] = new deviceType();
		
		return deviceType;
	}
	
	/**
	 * Load a new interface for controling devices
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.02
	 * @version  2013.02.12
	 *
	 * @returns    {elric.classes.Interface}   An Interface object
	 */
	elric.loadInterface = function loadInterface (interfaceName, pluginName) {
	
		var path = 'lib/interfaces/' + interfaceName + 'Interface';
		var debugm = '';
		
		if (pluginName) {
			path = 'plugins/' + pluginName + '/' + path;
			debugm = ' from Plugin "' + pluginName + '"';
		}
		
		path = mainDir + '/' + path;
		
		elric.log.debug('Requiring Interface "' + interfaceName + '"' + debugm);
		
		var constructor = require(path);
		
		var interf = elric.extend(elric.classes.BaseInterface,
		                          elric.classes.BaseInterface.prototype.preConstructor,
		                          constructor);

		// Store the new interface
		elric.interfaces[interfaceName] = new interf(elric);
		
		return elric.interfaces[interfaceName];
	}
	
	/**
	 * Load a new automation protocol
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.06
	 * @version  2013.02.12
	 *
	 * @returns  {elric.classes.AutomationProtocol}   An AutomationProtocol class
	 */
	elric.loadAutomationProtocol = function loadAutomationProtocol (protocolName, pluginName) {
	
		var path = 'lib/automation_protocols/' + protocolName + 'AutomationProtocol';
		var debugm = '';
		
		if (pluginName) {
			path = 'plugins/' + pluginName + '/' + path;
			debugm = ' from Plugin "' + pluginName + '"';
		}
		
		path = mainDir + '/' + path;
		
		elric.log.debug('Requiring Automation Protocol "' + protocolName + '"' + debugm);
		
		var constructor = require(path);
		
		var protocol = elric.extend(elric.classes.BaseAutomationProtocol,
		                          elric.classes.BaseAutomationProtocol.prototype.preConstructor,
		                          constructor);

		// Store the new protocol
		elric.automationProtocols[protocolName] = new protocol(elric);
		
		return elric.automationProtocols[protocolName];
	}

}