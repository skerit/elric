/**
 * The Console Output Action class
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  0.1.0
 */
alchemy.create('ElricAction', function ConsoleOutputElricAction() {

	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.0.1
	 * @version  0.1.0
	 */
	this.preInit = function preInit() {

		this.description = 'Output text/data to the console';

		this.blueprint = {
			message: {
				type: 'String',
				description: 'The message to print out to the console'
			}
		};
	};

	/**
	 * Output text to the console
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    0.0.1
	 * @version  0.1.0
	 */
	this.activate = function activate(payload) {
		console.log('>>> Action >>>');
		console.log(payload.message);
		console.log('<<< END <<<');
	};

});