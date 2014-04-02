/**
 * The Device Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
Model.extend(function DeviceModel() {
	
	this.preInit = function preInit() {

		this.parent();

		this.icon = 'lightbulb';

		this.belongsTo = {
			Interface: {
				modelName: 'Interface',
				foreignKey: 'interface_id'
			}
		};

		this.device_types = alchemy.shared('device.Types');
		this.automation_protocols = alchemy.shared('AutomationProtocols');
		this.interface_types = alchemy.shared('Elric.interfaces');

		this.blueprint = {
			name: {
				type: 'String'
			},
			device_type: {
				type: 'Enum'
			},
			automation_protocol: {
				type: 'Enum'
			},
			address: {
				type: 'Object'
			},
			interface_type: {
				type: 'Enum'
			},
			interface_id: {
				type: 'ObjectId'
			}
		};

		this.modelEdit = {
			general: {
				title: __('chimera', 'General'),
				fields: ['name', 'device_type', 'automation_protocol', 'address', 'interface_type', 'interface_id']
			}
		};

		this.modelIndex = {
			fields: ['name', 'device_type', 'automation_protocol', 'address', 'interface_type', 'interface_id']
		};
	};
});