/**
 * The App Controller class
 * All other controllers should inherit from this
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var AppController = Function.inherits('Controller', function AppController(conduit, options) {
	AppController.super.call(this, conduit, options);
});