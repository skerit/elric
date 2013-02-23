var bcrypt = require('bcrypt');
var async = require('async');

module.exports = function Api (elric) {
	
	/**
	 * Create an API route
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.23
	 * @version  2013.02.23
	 */
	elric.createApi = function createApi (method, path, callback) {
		elric.app[method]('/api' + path, callback);
	}
	
	/**
	 * Get a dataset from a model or memobject as an object
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.23
	 * @version  2013.02.23
	 */
	var _getDataSet = function _getDataSet (name, type, callback) {
		
		var resultset = {};
		
		if (type == 'model') {
			
			// See if this model exists
			if (typeof elric.models[name] != 'undefined') {
				
				// See if we have this in cache
				if (elric.models[name].enableCache && elric.models[name].cache) {
					resultset = elric.models[name].cache;
				} else {
					
					elric.models[name].model.find({}, function (err, items) {
						
						if (err) {
							callback({});
							return;
						}
						
						var resultset = {};
						
						for (var i in items) {
							var item = items[i];
							
							resultset[item._id] = item;
						}
						
						callback(resultset);
					});
				
					return;
				}
				
			}
			
		} else if (type == 'memobject') {
			
			if (typeof elric.memobjects[name] != 'undefined') {
				resultset = elric.memobjects[name];
			}
			
		}
		
		callback(resultset);
	}
	
	/**
	 * Get a dataset from a model or memobject
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.23
	 * @version  2013.02.23
	 */
	var getDataSet = function getDataSet (name, options, callback) {
		
		var type = options.type;
		var format = options.format;
		
		_getDataSet(name, type, function (data) {
			
			if (format == 'object') {
				callback(data)
			} else if (format == 'array') {
				var result_array = [];
				
				for (var i in data) {
					
					var record = elric.cloneRecord(data[i]);
					
					record.id = i;
					
					if (record.title) {
						record.text = record.title;
					} else if (record.name) {
						record.text = record.name;
					} else if (record.identifier) {
						record.text = record.identifier;
					}
					
					result_array.push(record);
				}
				
				callback(result_array);
			}
			
		});
	}
	
	
	/**
	 * Get a dataset from a model or memobject
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.23
	 * @version  2013.02.23
	 */
	elric.createApi('post', '/data/set/:type/:name', function (req, res) {
		
		var type = req.params.type;
		var name = req.params.name;
		
		var format = 'object';
		if (req.body.format) format = req.body.format;
		
		getDataSet(name, {type: type, format: format}, function(resultset) {
			res.end(JSON.stringify(resultset));
		});
		
	});
	
	/**
	 * Get a specific data record from a model or memobject
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.23
	 * @version  2013.02.23
	 */
	elric.createApi('post', '/data/record/:type/:name/:id', function (req, res) {
		
		var type = req.params.type;
		var name = req.params.name;
		
		var key_value = req.params.id;
		var key_field = '_id';
		
		if (typeof req.body.key_field != 'undefined') key_field = req.body.key_field;
		
		var format = 'object';
		if (req.body.array) format = 'array';
		
		getDataSet(name, {type: type, format: format}, function(resultset) {
			
			var record = {};
			
			if (typeof resultset[key_value] != 'undefined') {
				record = resultset[key_value];
			}
			
			res.end(JSON.stringify(record));
		});
		
	});
	
}