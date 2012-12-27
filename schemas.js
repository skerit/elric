var bcrypt = require('bcrypt');
var validate = require('mongoose-validator').validate;

module.exports = function Models(mongoose) {
	
	var nameValidator = [validate({message: "Username should be between 3 and 50 characters"}, 'len', 3, 50), validate('isAlphanumeric')];
	var passwordValidator = [validate({message: "Password should be between 5 and 100 characters"}, 'len', 5, 100)];
	
	/**
	 * The user schema
	 */
	var userSchema = mongoose.Schema({
		username: {
			type: String,
			required: true,
			validate: nameValidator
		},
		password: {
			type: String,
			required: true,
			validate: passwordValidator
		},
		email: String,
		firstname: String,
		lastname: String
	});
	
	userSchema.pre('save', function(next){
		if (this.password) this.password = bcrypt.hashSync(this.password, 10);
		next();
	});
	
	this.User = mongoose.model('User', userSchema);
	
	var kittySchema = mongoose.Schema({
		name: String
  });
	
	this.Kitten = mongoose.model('Kitten', kittySchema);
	
}