/**
 * The Wall Element Type
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
alchemy.create('ElementType', function WallElementType() {

	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.0.1
	 * @version  0.1.0
	 */
	this.preInit = function preInit() {

		// A wall is a straight line
		this.dimensions = 1;
		
		this.colourOri = '#BBCFCC';
		this.colourHover = '#909090';
		this.colourSelect = '#BBCCEE';
	};

});