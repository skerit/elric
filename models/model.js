var validate = require('mongoose-validator').validate;
var $ = require('jquery');

module.exports = function (elric) {
	
	/**
	 * The Base Model class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.15
	 * @version  2013.01.15
	 */
	elric.classes.BaseModel = function BaseModel () {
		
		// This constructor will be overwritten
		
	}
	
	var bm = elric.classes.BaseModel;
	var bp = bm.prototype;
	
	/**
	 * The name of this model
	 */
	bp.name = 'BaseModel';
	
	/**
	 * A link to mongoose
	 */
	bp.mongoose = elric.mongoose;
	
	/**
	 * A link to the validator
	 */
	bp.validate = validate;
	
	/**
	 * An empty blueprint
	 */
	bp.blueprint = {};
	
	/**
	 * An empty admin object
	 */
	bp.admin = {};
	
	/**
	 * An empty schema
	 */
	bp.schema = {};
	
	/**
	 * An empty model
	 */
	bp.model = {};
	
	/**
	 * Enable cache?
	 */
	bp.enableCache = false;
	
	/**
	 * An empty cache object
	 */
	bp.cache = {};
	
	/**
	 * An object to temporarily store the schema callbacks in
	 */
	bp._prepost = {
		pre: [],
		post: []
	};
	
	/**
	 * Add pre schema callbacks
	 * These will be added to the schema before the model is made
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.15
	 * @version  2013.01.15
	 *
	 * @param    {string}   name      The event name (save, init, ...)
	 * @param    {callback} callback  The callback to make
	 */
	bp.pre = function preSchema (name, callback) {
		var newCallback = {name: name, callback: callback};
		this._prepost.pre.push(newCallback);
	}
	
	/**
	 * Add post callbacks
	 * These will be added to the schema before the model is made
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.15
	 * @version  2013.01.31
	 *
	 * @param    {string}   name      The event name (save, init, ...)
	 * @param    {callback} callback  The callback to make
	 */
	bp.post = function postSchema (name, callback) {
		var newCallback = {name: name, callback: callback};
		this._prepost.post.push(newCallback);
	}
	
	/**
	 * The function to run after the passed constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.15
	 * @version  2013.01.15
	 */
	bp._init = function _init () {
		
		// Empty the cache (otherwise it's shared accross all models)
		this.cache = {};

		// Create the schema based on our blueprint
		this.schema = this._createSchema(this.blueprint);
		
		// Add the appropriate PRE callbacks
		for (var i in this._prepost.pre) {
			var obj = this._prepost.pre[i];
			this.schema.pre(obj.name, obj.callback);
		}
		
		// Add the appropriate POST callbacks
		for (var i in this._prepost.post) {
			var obj = this._prepost.post[i];
			this.schema.post(obj.name, obj.callback);
		}
		
		// Create the model based on that schema
		this.model = this._createModel(this.name, this.schema, this.enableCache);
	}
	
	/**
	 * Create a new Mongoose schema, with certain fields auto created
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.05
	 * @version  2013.01.15
	 *
	 * @param    {object}   blueprint   The schema blueprint
	 * 
	 * @returns  {object}   A mongoose schema
	 */
	bp._createSchema = function _createSchema (blueprint) {
		
		// Add the created & updated field
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
				
				// If it's an empty object,
				// just create an array of mixed, not subdocuments
				if ($.isEmptyObject(e.type)) {
					blueprintClone[fieldname] = [{}];
				} else {
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
		}
		
		var schema = elric.mongoose.Schema(blueprintClone);
		
		// Set the "updated" field to this timestamp before saving
		schema.pre('save', function(next){
			this.updated = Date.now();
			next();
		});
		
		return schema;
	}
	
	/**
	 * Create a new Mongoose model
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.14
	 * @version  2013.01.15
	 *
	 * @param    {string}   name        The model name
	 * @param    {object}   schema      The schema blueprint
	 * 
	 * @returns  {object}   A mongoose model
	 */
	bp._createModel = function _createModel (name, schema, cache) {
		
		if (cache === undefined) cache = false;
		
		var myObject = {};
		myObject.model = {};
		
		var thisModel = this;
		
		// If cache is true, tell the schema to regenerate the cache upon save
		if (cache) {
			
			schema.post('save', function (doc) {
				// Recreate the entire recordset
				// This is overkill, maybe we can just use the doc given?
				thisModel._cacheRecordset(myObject.model);
			})
		}
		
		// Create the model
		myObject.model = elric.mongoose.model(name, schema);
		
		// Cache the recordset a first time if wanted
		if (cache) this._cacheRecordset(myObject.model);
		
		return myObject.model;
	}
	
	/**
	 * Cache an entire model recordset for the given model
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.14
	 * @version  2013.01.31
	 *
	 * @param    {object}   model        The model
	 * @param    {object}   storage      Store the findings in here,
	 *                                   or in this model if false
	 */
	bp._cacheRecordset = function _cacheRecordset (model, storage) {
		
		var thisModel = this;
		
		if (storage === undefined) storage = false;
		
		if (storage) t = storage;

		// Find all records in this model
		model.find({}, function (err, items) {
			
			// Store every item in the temp var
			for (var index in items) {
				
				var item = items[index];
				
				// Store the item in the cache object
				// under its _id
				thisModel.cache[item._id] = item;
			}
		});
	}
}