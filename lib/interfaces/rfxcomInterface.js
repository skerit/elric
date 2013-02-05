//var rfxcominterface = require('rfxcom');

module.exports = function rfxcom (elric) {

	this.name = 'rfxcom';
	this.title = 'rfxcom';
	//this.interface = new rfxcominterface.RfxCom("/dev/ttyUSB1", {debug: true});
	
	elric.loadCapability('rfxcom');
	
	/**
	 * Turn a device on based on its address
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.05
	 * @version  2013.02.05
	 * 
	 * @param   {string}   address     The address of the device
	 * @param   {object}   options     An object of options
	 * @param   {function} callback    The function to call back
	 */
	this._switchOnAddress = function _switchOnAddress (address, options, callback) {
		
	}

}