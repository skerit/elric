module.exports = function (elric) {
	
	/**
	 * The Base Element Type class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.31
	 */
	elric.classes.BaseElementType = function BaseElementType () {
		
		// This constructor will be overwritten
		
	}
	
	var bet = elric.classes.BaseElementType;
	var bp = bet.prototype;
	
	/**
	 * The name/identifier of this element type
	 * Used for storing in the database
	 */
	bp.name = 'baseElementType';
	
	/**
	 * The title of this element type
	 * This should be shown in the interface instead of the name
	 */
	bp.title = 'Base Element Type';
	
	/**
	 * The dimensions this element type has
	 * 0 = a single dot
	 * 1 = a line (up or down)
	 * 2 = any
	 */
	bp.dimensions = 2;
	
	/**
	 * Colours
	 */
	bp.colourOri = '#000000';
	bp.colourHover = '#909090';
	bp.colourSelect = '#500000';
	
	/**
	 * What model to use for selects
	 */
	bp.model = false;
	
}