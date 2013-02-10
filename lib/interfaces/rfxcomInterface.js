//var rfxcominterface = require('rfxcom');

module.exports = function rfxcom (elric) {

	this.name = 'rfxcom';
	this.title = 'rfxcom';
	
	this.commands = {
		on: {
			name: 'on',
			title: 'On',
			description: 'Turn device on',
			class: 'btn-success',
			state: 1
		},
		off: {
			name: 'off',
			title: 'Off',
			description: 'Turn device off',
			class: 'btn-danger',
			state: 0
		}
	};
	
	elric.loadCapability('rfxcom');

}