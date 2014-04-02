/**
 * The Room Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
Model.extend(function RoomElementModel() {
	
	this.preInit = function preInit() {

		this.parent();

		this.icon = 'lightbulb-o';

		this.element_types = alchemy.shared('elementTypes');

		this.belongsTo = {
			Room: {
				modelName: 'Room',
				foreignKey: 'room_id'
			}
		};

		this.blueprint = {
			name: {
				type: 'String',
				required: true
			},
			room_id: {
				type: 'ObjectId',
				required: true
			},
			element_type: {
				type: 'Enum',
				required: true
			},
			type_external_id: {
				type: 'ObjectId',
				required: false
			},
			x: {
				type: 'Number',
				required: true
			},
			y: {
				type: 'Number',
				required: true
			},
			dx: {
				type: 'Number',
				required: true
			},
			dy: {
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
				fields: ['name', 'room_id', 'element_type', 'type_external_id', 'x', 'y', 'dx', 'dy', 'width', 'height']
			}
		};

		this.modelIndex = {
			fields: ['name', 'room_id', 'element_type', 'type_external_id', 'x', 'y', 'dx', 'dy', 'width', 'height']
		};
	};

});