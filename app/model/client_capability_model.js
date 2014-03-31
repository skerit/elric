/**
 * The Client Capability Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
Model.extend(function ClientCapabilityModel() {
	
	this.preInit = function preInit() {

		this.capabilities = alchemy.shared('Elric.capabilities');

		this.belongsTo = {
			Client: {
				modelName: 'Client',
				foreignKey: 'client_id'
			}
		};

		this.blueprint = {
			client_id: {
				type: 'ObjectId',
				required: true
			},
			capability: {
				type: 'Enum',
				required: true
			},
			enabled: {
				type: 'Boolean',
				required: true
			},
			settings: {
				type: 'Object'
			}
		};

		this.modelEdit = {
			general: {
				title: __('chimera', 'General'),
				fields: ['client_id', 'capability', 'enabled']
			}
		};

		this.modelIndex = {
			fields: ['client_id', 'capability', 'enabled']
		};
	};

});