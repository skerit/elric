/**
 * The AB600D Device Type
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var AB600D = Function.inherits('DeviceType', function Ab600dDeviceType() {});

/**
 * Set the title properties
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
AB600D.constitute(function setProperties() {

	// The AB600D Has only 1 command: toggle
	this.setProperty('commands', {
		toggle: {
			name: 'toggle',
			title: 'Toggle',
			description: 'Toggle the state of the light',
			class: 'btn-primary',
			// The 'off' command is interpreted as toggle
			protocol_command: ['off']
		}
	});
});

/**
 * Set the full-caps title
 */
AB600D.setProperty('title', 'AB600D');

/**
 * Set the protcol
 */
AB600D.setProperty('protocol', 'arc');

/**
 * Set the category
 */
AB600D.setProperty('category', 'light');