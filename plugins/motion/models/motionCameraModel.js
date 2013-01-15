/**
 * The motionCamera model
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2012.12.27
 * @version  2013.01.15
 */
module.exports = function motionCamera (elric) {
	
	var identifierValidator = [this.validate({message: "Identifier should be between 3 and 50 characters"},
																'len', 3, 50)];
	
	// Enable caching this model
	this.enableCache = true;
	
	this.blueprint = {
		identifier: {
			type: String,
			required: true,
			validate: identifierValidator,
			fieldType: 'String'
		},
		client_id: {
			type: this.mongoose.Schema.Types.ObjectId,
			required: true,
			fieldType: 'Select',
			source: {type: 'model', name: 'client'}
		},
		thread: {
			type: String,
			required: true,
			validate: this.validate('isNumeric'),
			fieldType: 'String'
		},
		host: {
			type: String,
			required: true,
			fieldType: 'String'
		},
		port: {
			type: String,
			required: true,
			validate: this.validate('isNumeric'),
			fieldType: 'String'
		},
	}
	
	this.admin = {
		title: 'Motion Cameras',
		fields: ['identifier', 'client_id', 'thread', 'host', 'port']
	}
	
}