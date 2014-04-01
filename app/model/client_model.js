/**
 * The Client Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
Model.extend(function ClientModel() {
	
	this.preInit = function preInit() {

		this.parent();

		this.icon = 'desktop';

		this.blueprint = {
			name: {
				type: 'String',
				required: true
			},
			key: {
				type: 'String',
				required: true
			},
			hostname: {
				type: 'String',
				required: true
			},
			ip: {
				type: 'String',
				required: true
			}
		};

		this.modelEdit = {
			general: {
				title: __('chimera', 'General'),
				fields: ['name', 'key', 'hostname', 'ip']
			}
		};

		this.modelIndex = {
			fields: ['name', 'key', 'hostname', 'ip']
		};
	};

});