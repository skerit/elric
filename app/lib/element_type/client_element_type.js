/**
 * The Client Element Type
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
alchemy.create('ElementType', function ClientElementType() {

	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.0.1
	 * @version  0.1.0
	 */
	this.preInit = function preInit() {

		this.dimensions = 0;

		this.colourOri = '#303030';
		this.colourHover = '#572727';
		this.colourSelect = '#A80000';

		this.model = 'Client';
	};

});