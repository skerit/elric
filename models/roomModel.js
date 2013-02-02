var validate = require('mongoose-validator').validate;

/**
 * The room model
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2012.12.28
 * @version  2013.01.15
 */
module.exports = function room (elric) {
	
	this.icon = 'building';
	
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
}