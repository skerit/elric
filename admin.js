var $ = require('jquery');
var async = require('async');

module.exports = function (elric) {
	
	/**
	 * The Admin class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.31
	 */
	elric.classes.Admin = function admin (model, options) {
		var thisAdmin = this;
		this.elric = elric;
		this.model = model;
		this.name = options.name;
		this.title = options.title ? options.title : this.name;
		this.icon = model.icon ? model.icon : 'cog';
		
		// The basic parameters we send with each render
		var baseOpt = {admin: elric.adminArray,
		               modelName: model.name,
		               titleName: model.admin.title,
		               fields: model.admin.fields};
		
		/**
		 * The model view route
		 */
		elric.app.get('/admin/' + this.name + '/view/:id', function (req, res) {
			
			var payload = {};
			
			// Find the item
			model.model.find({}, function(err, items) {
				
				elric.inject(payload, baseOpt);
				payload.items = items;
				
				// Render the view layout
				elric.render(req, res, 'admin/modelView', payload);
				
			});
			
		});
		
		/**
		 * The model index route
		 */
		elric.app.get('/admin/' + this.name + '/index', function (req, res) {
			model.model.find({}, function(err, items) {
				elric.render(req, res, 'admin/modelIndex', $.extend({}, baseOpt, {items: items}));
			});
		});

		/**
		 * The model add route
		 */
		elric.app.get('/admin/' + this.name + '/add', function (req, res) {
			
			var par = {};
			var bp = thisAdmin.model.blueprint;
			
			var syncresults = {};
			var returnObject = {blueprint: bp};
			
			for (var field in bp) {
				
				if (bp[field]['fieldType'] == 'Select') {
					
					// Get the data from a model or an object?
					var s = bp[field]['source'];
					
					if (s.type == 'model') {
						
						// Get the source model
						var fm = elric.models[s.name];
						
						// Prepare the async functions for serial execution
						par[s.name] = function(elementName) {
							return function(callback) {
								fm.model.find({}, function(err, items) {
									callback(null, items);
								});
							}
						}(s.name); // Closure! Because the s.name var changes over time
						
					} else if (s.type == 'memobject') {
						syncresults[s.name] = elric.memobjects[s.name];
					}
				}
				
			}
			
			if (!$.isEmptyObject(par)) {
				// Execute the find functions
				async.parallel(
					par,
					function(err, results) {
						var finalSelects = $.extend({}, results, syncresults);
						$.extend(returnObject, baseOpt, {selects: finalSelects});
						elric.render(req, res, 'admin/modelAdd', returnObject);
					}
				);
			} else {
				elric.render(req, res, 'admin/modelAdd', $.extend(returnObject, baseOpt, {selects: syncresults}));
			}
		});
		
		/**
		 * The POST model add route, to actually store the new item
		 */
		elric.app.post('/admin/' + this.name + '/add', function(req, res){
	
			var newrecord = new model.model(req.body);
			
			newrecord.save(function (err) {
				if (err) {
					res.send({ error: 'Saving new record failed!', errors: err });
				} else {
					
					res.send({ success: 'Saved!', redirect: '/admin/' + thisAdmin.name + '/index'});
					
				}
			});
		});
		
		/**
		 * The model edit route
		 */
		elric.app.get('/admin/' + this.name + '/edit/:id', function (req, res) {
			
			var serial = {};
			var bp = thisAdmin.model.blueprint;
			var syncresults = {};
			
			for (var field in bp) {
				if (bp[field]['fieldType'] == 'Select') {
					
					// Get the data from a model or an object?
					var s = bp[field]['source'];
					
					if (s.type == 'model') {
						
						// Get the source model
						var fm = elric.models[s.name];
						
						// Prepare the async functions for serial execution
						serial[s.name] = function(elementName) {
							return function(callback) {
								fm.model.find({}, function(err, items) {
									callback(null, items);
								});
							}
						}(s.name); // Closure! Because the s.name var changes over time
						
					} else if (s.type == 'memobject') {
						syncresults[s.name] = elric.memobjects[s.name];
					}
					
				}
			}
			
			serial['_itemToEdit'] = function (callback) {
				model.model.findOne({_id: req.params.id}, function(err, item) {
					callback(null, item);
				});
			}
			
			// Execute the find functions
			async.parallel(
				serial,
				function(err, results) {
					
					// Get the element we need to edit
					var itemToEdit = results['_itemToEdit'];
					
					// Delete it from the results object, because that's for filling selects
					delete results['_itemToEdit'];
					
					var finalSelects = $.extend({}, results, syncresults);
					var finalReturn = $.extend({}, baseOpt, {selects: finalSelects, item: itemToEdit, blueprint: bp});
					elric.render(req, res, 'admin/modelEdit', finalReturn);
				}
			);

		});
		
		elric.app.post('/admin/' + this.name + '/edit/:id', function(req, res){
	
			model.model.findOne({_id: req.params.id}, function(err, item) {
				
				for (var field in req.body) {
					item[field] = req.body[field];
				}
				
				item.save(function (err) {
					if (err) {
						res.send({ error: 'Updating record failed!', errors: err });
					} else {
						res.send({ success: 'Saved!', redirect: '/admin/' + thisAdmin.name + '/edit/' + req.params.id});
					}
				});
			});
		});
	}
}