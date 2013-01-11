var bcrypt = require('bcrypt');
var validate = require('mongoose-validator').validate;

module.exports = function User (elric) {
	
	var mongoose = elric.mongoose;
	
	var nameValidator = [validate({message: "Username should be between 3 and 50 characters"},
																'len', 3, 50),
											 validate('isAlphanumeric')];
	
	var passwordValidator = [validate({message: "Password should be between 5 and 100 characters"},
																		'len', 5, 100)];
	
	this.blueprint = {
		username: {
			type: String,
			required: true,
			validate: nameValidator,
			fieldType: 'String'
		},
		password: {
			type: String,
			required: true,
			validate: passwordValidator,
			fieldType: 'Password'
		},
		email: String,
		firstname: String,
		lastname: String
	}
	
	this.admin = {
		title: 'Users',
		fields: ['username', 'firstname', 'lastname', 'email']
	}
	
	/**
	 * The user schema
	 */
	this.schema = elric.Schema(this.blueprint);
	
	this.schema.pre('save', function(next){
		if (this.password) this.password = bcrypt.hashSync(this.password, 10);
		next();
	});
	
	this.model = mongoose.model('User', this.schema);
	
}