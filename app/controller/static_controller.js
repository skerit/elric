/**
 * The Static Controller class
 *
 * @constructor
 * @extends       alchemy.classes.AppController
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Static = Function.inherits('AppController', function StaticController(conduit, options) {
	StaticController.super.call(this, conduit, options);
});

/**
 * The home action
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param   {Conduit}   conduit
 */
Static.setMethod(function home(conduit) {

	var that = this;

	that.render('static/home');
});
