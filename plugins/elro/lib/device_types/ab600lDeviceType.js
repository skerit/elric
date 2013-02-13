module.exports = function ab600l (elric) {

	this.name = 'ab600l';
	this.title = 'AB600L';
	
	this.protocol = 'arc';
	this.category = 'light';
	
	var toggle = function toggle (device, current_state, callback) {

		var new_state = 1;
		
		if (current_state == 1) {
			new_state = 0;
		}
		
		if (callback) {
			callback(['off'], new_state);
		}
		
	}
	
	var toggle_off = function toggle_off (device, current_state, callback) {
		
		if (current_state == 1) {
			callback(['off'], 0);
		} else if (current_state == 0 || typeof current_state == 'undefined') {
			callback([], false);
		}
		
	}
	
	var toggle_on = function toggle_on (device, current_state, callback) {
		
		if (current_state == 0 || typeof current_state == 'undefined') {
			callback(['off'], 1);
		} else if (current_state == 1) {
			callback([], false);
		}
		
	}
	
	this.commands = {
		on: {
			name: 'on',
			title: 'On',
			description: 'Turn the light on',
			class: 'btn-success',
			protocol_command: false,
			state: false,
			handler: toggle_on
		},
		off: {
			name: 'off',
			title: 'Off',
			description: 'Turn the light off',
			class: 'btn-danger',
			protocol_command: false,
			state: false,
			handler: toggle_off
		},
		toggle: {
			name: 'toggle',
			title: 'Toggle',
			description: 'Toggle the state of the light',
			class: 'btn-primary',
			protocol_command: false,
			state: false,
			handler: toggle
		}
	};
	
}