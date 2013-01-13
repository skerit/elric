module.exports = function MovementEvent (elric) {
	
	var mongoose = elric.mongoose;
	
	this.blueprint = {
		// When did this event begin?
		// = First movement
		begin: {
			type: Date,
			default: Date.now,
			fieldType: 'Date'
		},
		// When was the last movement detected?
		last_movement: {
			type: Date,
			default: Date.now,
			fieldType: 'Date'
		},
		// When did the event end,
		// does NOT equal last movement
		end: {
			type: Date,
			fieldType: 'Date'
		},
		// Is this event finished?
		finished: {
			type: Boolean,
			default: false,
			fieldType: 'Checkbox'
		},
		// Where did this movement event come from?
		// Capability, eg: motion, x10, ...
		source_type: {
			type: String,
			fieldType: 'String'
		},
		// The source_type's source_id
		source_id: {
			type: mongoose.Schema.Types.ObjectId,
			fieldType: 'String'
		},
		// In what room did this happen
		room_id: {
			type: mongoose.Schema.Types.ObjectId,
			fieldType: 'Select',
			source: {type: 'model', name: 'room'}
		},
		// Is there a room_element_id
		room_element_id: {
			type: mongoose.Schema.Types.ObjectId,
			fieldType: 'Select',
			source: {type: 'model', name: 'roomElement'}
		},
		// Is there a movie file?
		movie: {
			type: String,
			fieldType: 'Filepath'
		},
		// Does this event have pictures?
		pictures: {
			type: String,
			array: true,
			fieldType: 'Filepath'
		}
	}
	
	this.admin = {
		title: 'Movement Events',
		fields: ['begin', 'end', 'source_type']
	}
	
	this.schema = elric.Schema(this.blueprint);
	
	this.model = mongoose.model('MovementEvent', this.schema);
}