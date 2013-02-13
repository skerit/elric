module.exports = function ab600d (elric) {

	this.name = 'ab600d';
	this.title = 'AB600D';
	
	this.protocol = 'arc';
	this.category = 'light';
	
	// These instructions need to be changed
	this.instructions.enable = false;
	this.instructions.disable = false;
	
	this.commands = {
		toggle: {
			name: 'toggle',
			title: 'Toggle',
			description: 'Toggle the state of the light',
			class: 'btn-primary',
			commands: ['off'] // The 'off' command is interpreted as toggle
		}
	};
	
}