module.exports = function (elric) {

	this.name = 'consoleOutput';
	this.title = 'Console Output';
	
	this.description = 'Output text/data to the console';
	
	this.blueprint = {
		message: {
			fieldType: 'String',
			title: 'Message',
			description: 'The message to print out to the console'
		}
	}
	
	this.activate = function activate (payload) {
		console.log('>>> Action >>>');
		console.log(payload.message);
		console.log('<<< END <<<');
	}
	
}