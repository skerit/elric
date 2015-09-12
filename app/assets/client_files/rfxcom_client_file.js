/**
 * The Rfxcom ClientFile
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
var Rfxcom = Function.inherits('ClientFile', function RfxcomClientFile(client, settings) {

	// Call the parent constructor
	RfxcomClientFile.super.call(this, client, settings);

});

module.exports = Rfxcom.create;