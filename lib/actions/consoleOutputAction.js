module.exports = function (elric) {

	this.name = 'consoleOutput';
	this.title = 'Console Output';
	
	this.description = 'Output text/data to the console';
	
	this.activate = function activate () {
		console.log('test');
	}
	
}