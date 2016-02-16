/**
 * The ARC Automation Protocol class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Arc = Function.inherits('Elric.AutomationProtocol', function ArcAutomationProtocol() {});

/**
 * Set properties
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Arc.constitute(function setProperties() {

	var commands;

	commands = {
		off: {
			name: 'off',
			title: 'Off',
			description: 'Command 0',
			value: 0
		},
		on: {
			name: 'on',
			title: 'On',
			description: 'Command 1',
			value: 1
		},
		all_off: {
			name: 'all_off',
			title: 'All Off',
			description: 'Command 5',
			value: 0
		},
		all_on: {
			name: 'all_on',
			title: 'All On',
			description: 'Command 6',
			value: 1
		},
		chime: {
			name: 'chime',
			title: 'Chime',
			description: 'Command 7',
			value: 1
		}
	};

	this.setProperty('commands', commands);
});


/**
 * The correct title of this protocol
 *
 * @type   {String}
 */
Arc.setProperty('title', 'ARC');

/**
 * The description of this protocol
 *
 * @type   {String}
 */
Arc.setProperty('description', 'A protocol commonly rebranded, for example: KAKU, Elro, ...');

/**
 * Repeat commands (to improve delivery)
 *
 * @type   {Boolean}
 */
Arc.setProperty('repeat', true);

/**
 * The available house codes, A tem P
 *
 * @type   {Array}
 */
Arc.setProperty('house_codes', ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']);

/**
 * The available unit codes, 1 tem 16
 *
 * @type   {Array}
 */
Arc.setProperty('unit_codes', Array.range(1, 17));