var validate = require('mongoose-validator').validate;

module.exports = function Motion (elric) {
	
	var mongoose = elric.mongoose;
	
	var identifierValidator = [validate({message: "Identifier should be between 3 and 50 characters"},
																'len', 3, 50)];
	
	this.blueprint = {
		identifier: {
			type: String,
			required: true,
			validate: identifierValidator,
			fieldType: 'String'
		},
		client_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			fieldType: 'Select',
			source: {type: 'model', name: 'client'}
		},
		thread: {
			type: String,
			required: true,
			validate: validate('isNumeric'),
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
			validate: validate('isNumeric'),
			fieldType: 'String'
		},
	}
	
	this.admin = {
		title: 'Motion Cameras',
		fields: ['identifier', 'client_id', 'thread', 'host', 'port']
	}
	
	/**
	 * The motion schema
	 */
	this.schema = mongoose.Schema(this.blueprint);
	
	this.model = mongoose.model('Motion', this.schema);
	
}