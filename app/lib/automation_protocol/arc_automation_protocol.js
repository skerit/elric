/**
 * The ARC Automation Protocol class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
alchemy.create('AutomationProtocol', function ArcAutomationProtocol() {

	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.0.1
	 * @version  0.1.0
	 */
	this.preInit = function preInit() {

		this.parent();

		this.title = 'ARC';
		this.description = 'A protocol commonly rebranded, for example: KAKU, Elro, ...';

		this.house_codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
		this.unit_codes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

		this.addressBlueprint = {
			house_code: {
				type: 'Enum'
			},
			unit_code: {
				type: 'Enum'
			}
		};

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
			},
			all_on: {
				name: 'all_on',
				title: 'All On',
				description: 'Turn all devices on',
				class: 'btn-success',
				state: 1
			},
			all_off: {
				name: 'all_off',
				title: 'All Off',
				description: 'Turn all devices off',
				class: 'btn-danger',
				state: 0
			},
			chime: {
				name: 'chime',
				title: 'Chime',
				description: 'Makes a doorbell ring',
				class: 'btn-primary',
				state: 1
			}
		};
	};

});