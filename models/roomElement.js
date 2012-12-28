var validate = require('mongoose-validator').validate;

module.exports = function RoomElement (elric) {
	
	var mongoose = elric.mongoose;
	
	var nameValidator = [validate({message: "Room Element name should be between 3 and 50 characters"},
																'len', 3, 50),
											 validate('isAlphanumeric')];
	
	this.blueprint = {
		name: {
			type: String,
			required: true,
			validate: nameValidator,
			fieldType: 'String'
		},
		room_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			fieldType: 'Select',
			source: 'room'
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
		title: 'Room Elements',
		fields: ['name', 'room_id', 'x', 'y', 'width', 'height']
	}

	this.schema = mongoose.Schema(this.blueprint);
	
	this.model = mongoose.model('RoomElement', this.schema);
	
}