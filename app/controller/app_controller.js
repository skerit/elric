/**
 * The App Controller class
 * All other controllers should inherit from this
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.0.1
 * @version  1.0.0
 */
var AppController = Function.inherits('Controller', function AppController(conduit, options) {
	Controller.call(this, conduit, options);
});