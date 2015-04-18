var Protocols = alchemy.shared('Elric.Protocols'),
    Blast      = __Protoblast;

Blast.on('extended', function(parent, child) {

	var typeName,
	    name;

	if (parent.name.endsWith('AutomationProtocol')) {
		name = child.name.beforeLast('AutomationProtocol') || 'AutomationProtocol';
		typeName = name.underscore();

		child.setProperty('title', name);
		child.setProperty('typeName', typeName);

		Protocols[typeName] = child;
	}
});

/**
 * The Base Automation Protocol class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var AProtocol = Function.inherits('Informer', function AutomationProtocol() {

	this.addressSchema = new alchemy.classes.Schema(this);
	this.schema = new alchemy.classes.Schema(this);

	/**
	 * The basic commands this protocol supports
	 * Warning: even though these have descriptive names, some automation
	 *          protocols do not "force" this expected behaviour.
	 * Example: ARC has "dimmable" light modules which DO NOT respond to "on"
	 *          and "off" as expected, instead it toggles light when receiving
	 *          the "off" command and it does a light dim-cycle on "on".
	 */
	this.commands = {
		on: {
			name: 'on',
			title: 'Switch On',
			description: 'Turn device on',
			state: 1
		},
		off: {
			name: 'off',
			title: 'Switch Off',
			description: 'Turn device off',
			state: 0
		}
	};
});

/**
 * The description of this protocol
 *
 * @type   {String}
 */
AProtocol.setProperty('description', '');