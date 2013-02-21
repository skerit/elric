module.exports = function motionActivity (elric) {

	this.name = 'motion';
	this.title = 'Motion';
	this.plugin = 'motion';
	
	this.categories = ['Movement', 'Motion'];
	
	this.blueprint = {
		cameraid: {
			fieldType: 'String',
			title: 'Camera ID',
			description: 'The camera identifier, as it is known in the database'
		},
		pixels: {
			fieldType: 'Number',
			title: 'Pixels changes',
			description: 'The number of pixels that have changed for motion to be detected'
		},
		x: {
			fieldType: 'Number',
			title: 'Image X coordinate',
			description: 'The X coordinate of the changes on the image'
		},
		y: {
			fieldType: 'Number',
			title: 'Image Y coordinate',
			description: 'The Y coordinate of the changes on the image'
		},
		noise: {
			fieldType: 'Number',
			title: 'Image noisiness',
			description: 'The amount of noise in the image'
		},
		epoch: {
			fieldType: 'Epoch',
			title: 'Epoch',
			description: 'When the activity started according to Motion'
		},
		eventnr: {
			fieldType: 'Number',
			title: 'Event number',
			description: 'The event number according to Motion'
		}
	};
	
	this.instanceConstructor = function (elric, options) {
		this.payload = options;
	}
	
}