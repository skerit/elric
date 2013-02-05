module.exports = function (elric) {

	this.name = 'rfxcom_interface';
	this.title = 'rfxcom Interface';
	this.version = '2013-02-05.01';
	this.plugin = false;
	
	this.settingBlueprint = {
		device_path: {
			fieldType: 'String',
			default: '/dev/ttyUSB0',
			title: 'Device'
		}
	}
	
	this.fields = ['device_path'];

}