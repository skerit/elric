module.exports = function ab600d (elric) {

	this.name = 'ab600d';
	this.title = 'AB600D';
	
	this.protocol = 'arc';
	this.category = 'light';
	
	this.commands = {
		on: false,
		off: false,
		toggle: {
			name: 'toggle',
			title: 'Toggle',
			description: 'Toggle the state of the light',
			class: 'btn-primary',
			commands: ['off'] // The 'off' command is interpreted as toggle
		}
	};
	
}