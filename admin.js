var $ = require('jquery');
var async = require('async');

module.exports = function (elric) {
	
	elric.app.get('/admin/:modelname/index', function (req, res) {
		
		var modelname = req.params.modelname;
		var model = elric.models[modelname];
		
		var baseOpt = {admin: elric.adminArray, modelName: model.name, titleName: model.title}
		
		model.model.find({}, function(err, items) {
			elric.render(req, res, 'admin/modelIndex', $.extend({}, baseOpt, {items: items}));
		});
	});
	
	elric.classes.Admin = function admin (model, options) {
		var thisAdmin = this;
		this.elric = elric;
		this.model = model;
		this.name = options.name;
		this.title = options.title ? options.title : this.name;
		
		var baseOpt = {admin: elric.adminArray, modelName: this.name, titleName: this.title, options: options, model: this.model}
		
		// Admin routes
		elric.app.get('/admin/' + this.name + '/view/:id', function (req, res) {
			model.model.find({}, function(err, items) {
				elric.render(req, res, 'adminView', $.extend({}, baseOpt, {items: items}));
			});
		});
		
		
		
		elric.app.get('/admin/' + this.name + '/add', function (req, res) {
			var serial = {}
			var bp = thisAdmin.model.blueprint;
			var syncresults = {}
			
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
			
			if (!$.isEmptyObject(serial)) {
				// Execute the find functions
				async.parallel(
					serial,
					function(err, results) {
						var finalSelects = $.extend({}, results, syncresults);
						var finalReturn = $.extend({}, baseOpt, {selects: finalSelects});
						elric.render(req, res, 'adminAdd', finalReturn);
					}
				);
			} else {
				elric.render(req, res, 'adminAdd', $.extend({}, baseOpt, {selects: syncresults}));
			}
		});
		
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
		
		elric.app.get('/admin/' + this.name + '/edit/:id', function (req, res) {
			
			var serial = {}
			var bp = thisAdmin.model.blueprint;
			var syncresults = {}
			
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
					var finalReturn = $.extend({}, baseOpt, {selects: finalSelects, item: itemToEdit});
					elric.render(req, res, 'adminEdit', finalReturn);
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