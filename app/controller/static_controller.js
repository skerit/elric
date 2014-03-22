/**
 * The Static Controller class
 *
 * @constructor
 * @extends       alchemy.classes.AppController
 *
 * @author        Jelle De Loecker   <jelle@kipdola.be>
 * @since         0.0.1
 * @version       0.0.1
 */
module.exports = Controller.extend(function StaticController (){
	
	this.useModel = false;

	/**
	 * The home action
	 *
	 * @param   {function}   render       The function to call in order to render
	 *                                    the appropriate view.
	 *                       render.req   The request object
	 *                       render.req   The response object
	 */
	this.home = function home(render) {
		render({message: 'world'});
	};

});
