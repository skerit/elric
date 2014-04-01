var capabilities = alchemy.shared('Elric.capabilities');

/**
 * The Elric Capability class
 * These define the options you can set per capability, per client.
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
alchemy.create(function Capability() {

	/**
	 * The version of the client file
	 *
	 * @type   {String}
	 */
	this.version = '0.1.0';

	/**
	 * Set the title properties
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {Function}   parent   The parent class
	 * @param    {Function}   child    The (extended) child class
	 */
	this.__extended__ = function __extended__(parent, child) {

		// Extract the name
		var name     = child.name.replace(/Capability$/, ''),
		    typeName = name.underscore(),
		    title    = name.titleize();

		child.prototype.typeName = typeName;

		// Do not let the child inherit the extendonly setting
		if (!child.prototype.hasOwnProperty('title')) {
			child.prototype.title = title;
		}

		// Register this protocol
		if (!child.prototype.extendonly) {
			capabilities[typeName] = title;
		}
	};

	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.0.1
	 * @version  0.1.0
	 */
	this.preInit = function preInit() {

		/**
		 * The description of this action
		 */
		this.description = '';
		
		/**
		 * The structure of the payload
		 */
		this.blueprint = false;
	};
});