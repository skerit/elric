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
	client.socket.on('device_command_rfxcom', function(packet){
		
		var command = packet.command;
		var interface_id = packet.interface_id;
		
		// @todo: different protocols (this is just ARC)
		var house = packet.address.house_code + 40;
		var unit = packet.address.unit_code;
		
		var address = '0x' + house + '/' + unit;

		try {
			switch (command.toLowerCase()) {
				
				case 'on':
					light1.switchOn(address);
					break;
				
				case 'off':
					light1.switchOff(address);
					break;
				
				case 'all_on':
					light1._sendCommand(address, 6);
					break;
				
				case 'all_off':
					light1._sendCommand(address, 5);
					break;
				
				// Just for testing
				case 'toggle':
					console.log('Testing toggle');
					light1._sendCommand(address, {command: 0, cmdId: 99});
					break;
				
				case 'chime':
					light1._sendCommand(address, 7);
					break;
			}
		} catch (err) {
			console.log('Error sending command to device >>>');
			console.log(err);
			console.log('<<<');
		}
		
	});
	
}