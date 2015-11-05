/**
 * The Hue Automation Protocol class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Hue = Function.inherits('AutomationProtocol', function HueAutomationProtocol() {});

/**
 * Set properties
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  1.0.0
 */
Hue.constitute(function setProperties() {

	var commands;

	commands = {
		on: {
			name: 'on',
			title: 'On',
			description: 'On-state',
			value: 1
		},
		off: {
			name: 'off',
			title: 'Off',
			description: 'Off-state',
			value: 0
		},
		brightness: {
			name: 'brightness',
			title: 'Brightness',
			description: 'Set brightness',
			range: Array.range(0, 256)
		},
		hue: {
			name: 'hue',
			title: 'Hue',
			description: 'Set hue',
			range: Array.range(0, 65536)
		},
		saturation: {
			name: 'saturation',
			title: 'Saturation',
			description: 'Set saturation',
			range: Array.range(0, 256)
		}
	};

	this.setProperty('commands', commands);
});


/**
 * The correct title of this protocol
 *
 * @type   {String}
 */
Hue.setProperty('title', 'Philips Hue');

/**
 * The description of this protocol
 *
 * @type   {String}
 */
Hue.setProperty('description', 'The Philips Hue proprietary protocol');

/**
 * Repeat commands (to improve delivery)
 *
 * @type   {Boolean}
 */
Hue.setProperty('repeat', false);