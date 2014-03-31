/**
 * The Closet Element Type
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
alchemy.create('ElementType', function ClosetElementType() {

	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.0.1
	 * @version  0.1.0
	 */
	this.preInit = function preInit() {

		this.dimensions = 2;

		this.colourOri = '#B06905';
		this.colourHover = '#A68E34';
		this.colourSelect = '#5A3F2E';
	};

});