var deviceTypes = alchemy.shared('device.Types'),
    categories  = alchemy.shared('device.categories');

/**
 * The Device Type class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
alchemy.create(function DeviceType() {

	/**
	 * What protocol this device type used
	 * eg: arc, x10, zwave, ...
	 */
	this.protocol = false;

	/**
	 * The device category
	 */
	this.category = false;
	
	/**
	 * The commands this device accepts
	 */
	this.commands = false;
	
	/**
	 * Link basic instructions to commands
	 */
	this.instructions = false;
	
	/**
	 * The meaning behind the protocol commands
	 */
	this.protocol_meaning = false;

	/**
	 * The category of this device
	 */
	this.category = 'any';

	/**
	 * Set the title properties
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @param    {Function}   parent   The parent class
	 * @param    {Function}   child    The (extended) child class
	 */
	this.__extended__ = function __extended__(parent, child) {

		// Extract the name
		var name     = child.name.replace(/DeviceType$/, ''),
		    typeName = name.underscore(),
		    title    = name.titleize();

		child.prototype.typeName = typeName;

		// Do not let the child inherit the extendonly setting
		if (!child.prototype.hasOwnProperty('title')) {
			child.prototype.title = title;
		}

		categories[child.prototype.category] = typeName;

		// Register this protocol
		if (!child.prototype.extendonly || !child.prototype.hasOwnProperty('extendonly')) {
			deviceTypes[typeName] = title;
		}
	};

	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.0.1
	 * @version  0.1.0
	 */
	this.preInit = function preInit() {

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
				protocol_command: 'on',
				state: 1
			},
			off: {
				name: 'off',
				title: 'Off',
				description: 'Turn device off',
				class: 'btn-danger',
				protocol_command: 'off',
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

	};

});