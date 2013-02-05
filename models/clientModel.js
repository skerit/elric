/**
 * The client model
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.06
 * @version  2013.01.15
 */
module.exports = function client (elric) {
	
	// Enable caching this model
	this.enableCache = true;
	
	this.icon = 'desktop';
	
	this.blueprint = {
		name: {
			type: String,
			required: true,
			fieldType: 'String'
		},
		key: {
			type: String,
			required: true,
			fieldType: 'String'
		},
		hostname: {
			type: String,
			required: true,
			fieldType: 'String'
		},
		ip: {
			type: String,
			required: true,
			fieldType: 'String'
		}
	};
	
	this.admin = {
		title: 'Clients',
		fields: ['name', 'key', 'hostname', 'ip']
	};
}