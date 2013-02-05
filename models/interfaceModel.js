/**
 * The interface model
 *
 * Every interface *instance* on clients are stored in here
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.05
 * @version  2013.02.05
 */
module.exports = function interfaceModel (elric) {

	// Enable caching this model
	this.enableCache = true;
	
	this.icon = 'screenshot';
	
	this.blueprint = {
		title: {
			type: String,
			fieldType: 'String'
		},
		client_id: {
			type: this.mongoose.Schema.Types.ObjectId,
			required: true,
			fieldType: 'Select',
			source: {type: 'model', name: 'client'}
		},
		interface_type: {
			type: String,
			required: true,
			fieldType: 'Select',
			source: {type: 'memobject', name: 'interfaces'}
		}
	};
	
	this.admin = {
		title: 'Interfaces',
		fields: ['title', 'client_id', 'interface_type']
	};
	
	this.pre('save', function(next){
		console.log('Saving ' + this.title);
		if (!this.title) {
			var cname = elric.models.client.cache[this.client_id].name;
			this.title = this.interface_type + ' on ' + cname;
		}
		
		next();
	});
	
}