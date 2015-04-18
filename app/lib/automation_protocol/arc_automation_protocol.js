/**
 * The ARC Automation Protocol class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Arc = Function.inherits('AutomationProtocol', function ArcAutomationProtocol() {

	ArcAutomationProtocol.super.call(this);

	this.schema.setEnumValues('house_code', this.house_codes);
	this.schema.setEnumValues('unit_code', this.unit_codes);

	this.commands = {
		on: {
			name: 'on',
			title: 'On',
			description: 'Turn device on',
			state: 1
		},
		off: {
			name: 'off',
			title: 'Off',
			description: 'Turn device off',
			state: 0
		},
		all_on: {
			name: 'all_on',
			title: 'All On',
			description: 'Turn all devices on',
			state: 1
		},
		all_off: {
			name: 'all_off',
			title: 'All Off',
			description: 'Turn all devices off',
			state: 0
		},
		chime: {
			name: 'chime',
			title: 'Chime',
			description: 'Makes a doorbell ring',
			state: 1
		}
	};
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