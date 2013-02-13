module.exports = function (elric) {
	
	/**
	 * The Base Device Type class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.11
	 */
	elric.classes.BaseDeviceType = function BaseDeviceType () {
		
		// This constructor will be overwritten
		
	}
	
	var bet = elric.classes.BaseDeviceType;
	var bp = bet.prototype;
	
	/**
	 * The name/identifier of this device type
	 * Used for storing in the database
	 */
	bp.name = 'baseDeviceType';
	
	/**
	 * The title of this device type
	 * This should be shown in the interface instead of the name
	 */
	bp.title = 'Base Device Type';
	
	/**
	 * What protocol this device type used
	 * eg: arc, x10, zwave, ...
	 */
	bp.protocol = false;
	
	/**
	 * The device category
	 */
	bp.category = '';
	
	/**
	 * The commands this device accepts
	 */
	bp.commands = {};
	
	/**
	 * Link basic instructions to commands
	 */
	bp.instructions = {};
	
	/**
	 * The meaning behind the protocol commands
	 */
	bp.protocol_meaning = {};
	
	/**
	 * The preconstructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.13
	 * @version  2013.02.13
	 */
	bp.preConstructor = function () {
		
		this.instructions = {};
		
		// Link the 'enable' instruction to the 'on' command by default
		this.instructions.enable = 'on';
		
		// Link the 'disable' instruction to the 'off' command by default
		this.instructions.disable = 'off';
		
		// Set default commands
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
		
		this.protocol_meaning = {
			on: {
				state: 1
			},
			off: {
				state: 0
			}
		}
		
	}
}