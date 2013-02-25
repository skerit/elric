module.exports = function motionActivity (elric) {

	this.name = 'motion';
	this.title = 'Motion';
	this.plugin = 'motion';
	
	this.categories = ['Movement', 'Motion'];
	
	this.blueprint = {
		camera_id: {
			fieldType: 'String',
			group: 'Origin',
			title: 'Camera',
			description: 'The camera identifier, as it is known in the database',
			source: {type: 'model', name: 'motionCamera'}
		},
		pixels: {
			fieldType: 'Number',
			group: 'Motion image data',
			title: 'Pixels changes',
			description: 'The number of pixels that have changed for motion to be detected'
		},
		x: {
			fieldType: 'Number',
			group: 'Motion image data',
			title: 'Image X coordinate',
			description: 'The X coordinate of the changes on the image'
		},
		y: {
			fieldType: 'Number',
			group: 'Motion image data',
			title: 'Image Y coordinate',
			description: 'The Y coordinate of the changes on the image'
		},
		noise: {
			fieldType: 'Number',
			group: 'Motion image data',
			title: 'Image noisiness',
			description: 'The amount of noise in the image'
		},
		epoch: {
			fieldType: 'Epoch',
			group: 'Event data',
			title: 'Epoch',
			description: 'When the activity started according to Motion'
		},
		eventnr: {
			fieldType: 'Number',
			group: 'Event data',
			title: 'Event number',
			description: 'The event number according to Motion'
		},
		room_id: {
			fieldType: 'String',
			group: 'Origin',
			title: 'Room',
			description: 'The room the camera is in',
			source: {type: 'model', name: 'room'}
		},
		element_id: {
			fieldType: 'String',
			group: 'Origin',
			title: 'Room Element',
			description: 'The room element',
			source: {type: 'model', name: 'roomElement'}
		}
	};
	
	this.instanceConstructor = function (elric, options) {
		this.payload = options;
	}
	
}