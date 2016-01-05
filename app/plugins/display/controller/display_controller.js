/**
 * The Chimera Static Controller class
 *
 * @author        Jelle De Loecker   <jelle@kipdola.be>
 * @since         0.2.0
 * @version       0.2.0
 */
var Display = Function.inherits('Controller', function DisplayController(conduit) {
	Controller.call(this, conduit);
});

/**
 * The 'start' action is the main screen of a display
 *
 * @param   {Conduit}   conduit
 */
Display.setMethod(function start(conduit) {
	this.render('display/start');
});