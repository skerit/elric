var async = require('async');
var request = require('request');
var rfxcom = require('node-rfxcom');
var $;

module.exports = function (client) {
	
	$ = client.jQuery;
	var thisClient = this;
	var me = client.settings.rfxcom;
	var settings = me.settings;
	
	var rfx;
	var light1;

	var submit = client.filteredSubmit('rfxcom');
	
	client.event.on('start', function() {
		
		console.log('rfxcom is starting after everything has loaded');
		
		rfx = new rfxcom.RfxCom(settings.device_path, {debug: true});
		
		rfx.initialise(function () {
			light1 = new rfxcom.Lighting1(rfx, rfxcom.lighting1.ARC);
		});
		
	});
	
	// Set detection options
	client.socket.on('switch_device', function(packet){
		
		var deviceid = packet.deviceid;
		var addressobj = packet.address;
		var switchState = packet.state;

		// We just use ARC now
		var house = addressobj.house_code + 40;
		var unit = addressobj.unit_code;
		
		var address = '0x' + house + '/' + unit;

		try {
			if (switchState) {
				light1.switchOn(address);
			} else {
				light1.switchOff(address);
			}
		} catch (err) {
			console.log('Error in switching device >>>');
			console.log(err);
			console.log('<<<');
		}
	});
	
}