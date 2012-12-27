var validate = require('mongoose-validator').validate;

module.exports = function Motion (elric) {
	
	var mongoose = elric.mongoose;
	
	var identifierValidator = [validate({message: "Identifier should be between 3 and 50 characters"},
																'len', 3, 50),
											 validate('isAlphanumeric')];
	
	this.blueprint = {
		identifier: {
			type: String,
			required: true,
			validate: identifierValidator,
			fieldType: 'String'
		},
		host: {
			type: String,
			required: true,
			validate: validate({message: "Host should be between 3 and 200 characters"},
																'len', 3, 200),
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
		fields: ['identifier', 'host', 'port']
	}
	
	/**
	 * The motion schema
	 */
	this.schema = mongoose.Schema(this.blueprint);
	
	this.model = mongoose.model('Motion', this.schema);
	
}