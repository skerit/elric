var elementTypes = alchemy.shared('elementTypes');

/**
 * The Element Type class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
alchemy.create(function ElementType() {

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
		var name     = child.name.replace(/ElementType$/, ''),
		    typeName = name.underscore(),
		    title    = name.titleize();

		child.prototype.typeName = typeName;

		// Do not let the child inherit the extendonly setting
		if (!child.prototype.hasOwnProperty('title')) {
			child.prototype.title = title;
		}

		// Register this protocol
		if (!child.prototype.extendonly) {
			elementTypes[typeName] = new child();
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
		 * The dimensions this element type has
		 * 0 = a single dot
		 * 1 = a line
		 * 2 = any
		 */
		this.dimensions = 2;
		
		/**
		 * Colours
		 */
		this.colourOri = '#000000';
		this.colourHover = '#909090';
		this.colourSelect = '#500000';
		
		/**
		 * What model to use for selects
		 */
		this.model = false;
	};

});