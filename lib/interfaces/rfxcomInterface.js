module.exports = function rfxcom (elric) {

	this.name = 'rfxcom';
	this.title = 'rfxcom';

	this.protocols = ['arc', 'x10rf'];
	
	elric.loadCapability('rfxcom');

}