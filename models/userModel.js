var bcrypt = require('bcrypt');
var validate = require('mongoose-validator').validate;

/**
 * The user model
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2012.12.27
 * @version  2013.01.15
 */
module.exports = function user (elric) {
	
	// Enable caching this model
	this.enableCache = true;

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
	
	this.pre('save', function(next){
		if (this.password) this.password = bcrypt.hashSync(this.password, 10);
		next();
	});
}