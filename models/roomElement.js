var validate = require('mongoose-validator').validate;
var async = require('async');

module.exports = function RoomElement (elric) {
	
	var mongoose = elric.mongoose;
	var thisModel = this;
	
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
		dx: {
			type: Number,
			required: true,
			fieldType: 'Number'
		},
		dy: {
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
		fields: ['name', 'room_id', 'x', 'y', 'dx', 'dy', 'width', 'height']
	}

	this.schema = mongoose.Schema(this.blueprint);
	
	this.model = mongoose.model('RoomElement', this.schema);
	
	// Create the update routes
	elric.app.post('/roomelement/updates', function (req, res) {
		
		var elements = req.body;
		var par = [] // Functions to perform in parallel
		
		for (var id in elements) {
			
			var el = elements[id];
			
			par.push(function(callback) {
				thisModel.model.findOne({_id: id}, function(err, element) {
					
					element.room_id = el.room_id;
					element.x = el.x;
					element.y = el.y;
					element.dx = el.dx;
					element.dy = el.dy;
					
					element.save(function(err, product){
						callback(null, {_id: id, err: err});
					});
					
				});
			});
		}
		
		async.parallel(
			par,
			function(err, results) {
				res.send(results);
			}
		);
		
	});
	
}