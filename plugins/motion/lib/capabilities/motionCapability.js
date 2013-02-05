module.exports = function (elric) {

	this.name = 'motion';
	this.title = 'Motion';
	this.version = '2013-01-06.01';
	this.plugin = 'motion';
	
	this.settingBlueprint = {
		host: {
			fieldType: 'String',
			default: 'localhost',
			title: 'Host'
		},
		port: {
			fieldType: 'String',
			default: 8084,
			title: 'Port'
		},
		login: {
			fieldType: 'String',
			default: 'login',
			title: 'Login'
		},
		password: {
			fieldType: 'String',
			default: 'password',
			title: 'Password'
		}
	}
	
	this.fields = ['host', 'port', 'login', 'password'];

}