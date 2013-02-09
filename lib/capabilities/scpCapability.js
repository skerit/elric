module.exports = function scp (elric) {

	this.name = 'scp';
	this.title = 'scp File Transfer';
	this.version = '2013-02-09.01';
	this.plugin = false;
	
	this.settingBlueprint = {
		login: {
			fieldType: 'String',
			default: 'elric',
			title: 'Login Username'
		},
		port: {
			fieldType: 'String',
			default: '22',
			title: 'SSH Port'
		}
	}
	
	this.fields = ['login'];

}