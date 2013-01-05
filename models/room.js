var validate = require('mongoose-validator').validate;

module.exports = function Room (elric) {
	
	var mongoose = elric.mongoose;
	
	var nameValidator = [validate({message: "Room name should be between 3 and 50 characters"},
																'len', 3, 50),
											 validate('isAlphanumeric')];
	
	this.blueprint = {
		name: {
			type: String,
			required: true,
			validate: nameValidator,
			fieldType: 'String'
		},
		z: {
			type: Number,
			required: true,
			fieldType: 'Number'
		},
		x: {
			type: Number,
			required: true,
			fieldType: 'Number'
		},
		y: {
			type: Number,
			required: true,
			fieldType: 'Number'
		},
		width: {
			type: Number,
			required: true,
			fieldType: 'Number'
		},
		height: {
			type: Number,
			required: true,
			fieldType: 'Number'
		}
	}
	
	this.admin = {
		title: 'Rooms',
		fields: ['name', 'z', 'x', 'y', 'width', 'height']
	}

	this.schema = elric.Schema(this.blueprint);
	
	this.model = mongoose.model('Room', this.schema);
	
}