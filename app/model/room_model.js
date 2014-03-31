/**
 * The Room Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
Model.extend(function RoomModel() {
	
	this.preInit = function preInit() {

		this.icon = 'home';

		this.blueprint = {
			name: {
				type: 'String',
				required: true
			},
			x: {
				type: 'Number',
				required: true
			},
			y: {
				type: 'Number',
				required: true
			},
			z: {
				type: 'Number',
				required: true
			},
			width: {
				type: 'Number',
				required: true
			},
			height: {
				type: 'Number',
				required: true
			}
		};

		this.modelEdit = {
			general: {
				title: __('chimera', 'General'),
				fields: ['name', 'z', 'x', 'y', 'width', 'height']
			}
		};

		this.modelIndex = {
			fields: ['name', 'z', 'x', 'y', 'width', 'height']
		};
	};

});