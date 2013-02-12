module.exports = function ab600l (elric) {

	this.name = 'ab600l';
	this.title = 'AB600L';
	
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