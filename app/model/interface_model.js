/**
 * The Interface Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
Model.extend(function InterfaceModel() {
	
	this.preInit = function preInit() {

		this.parent();

		this.icon = 'screenshot';

		this.interface_types = alchemy.shared('Elric.interfaces');

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
			interface_type: {
				type: 'Enum',
				required: true
			},
			title: {
				type: 'String'
			}
		};

		this.modelEdit = {
			general: {
				title: __('chimera', 'General'),
				fields: ['title', 'client_id', 'interface_type']
			}
		};

		this.modelIndex = {
			fields: ['title', 'client_id', 'interface_type']
		};
	};

	/**
	 * Prepare the recordset before saving
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.0.1
	 * @version  0.1.0
	 */
	this.prepareSave = function prepareSave(recordset) {

		var item = recordset.Interface;

		if (!item.title) {
			item.title = item.interface_type + ' on ' + item.client_id;
		}

		return recordset;
	};

});