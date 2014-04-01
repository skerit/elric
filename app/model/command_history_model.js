/**
 * The Command History Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
Model.extend(function CommandHistoryModel() {
	
	this.preInit = function preInit() {

		this.parent();

		this.icon = 'time';

		this.belongsTo = {
			Device: {
				modelName: 'Device',
				foreignKey: 'device_id'
			},
			Interface: {
				modelName: 'Interface',
				foreignKey: 'interface_id'
			},
			Room: {
				modelName: 'Room',
				foreignKey: 'room_id'
			}
		};

		this.blueprint = {
			device_id: {
				type: 'ObjectId'
			},
			interface_id: {
				type: 'ObjectId'
			},
			room_id: {
				type: 'ObjectId'
			},
			command: {
				type: 'String'
			},
			origin: {
				type: 'Object'
			}
		};

		this.modelEdit = {
			general: {
				title: __('chimera', 'General'),
				fields: ['device_id', 'interface', 'room_id', 'command', 'origin']
			}
		};

		this.modelIndex = {
			fields: ['device_id', 'interface', 'room_id', 'command']
		};
	};
});