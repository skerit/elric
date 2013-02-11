/**
 * A client capability class
 *
 * These define the options you can set per capability, per client.
 * Every capability has a "client file", which you can store here:
 *
 * lib/client_files/nameClientFile.js
 *
 * This client file will be sent to the client upon connection,
 * and executed in its scope
 */
module.exports = function (elric) {
	
	/**
	 * The Base Capability class
	 *
	 * @constructor
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.06
	 */
	elric.classes.BaseCapability = function BaseCapability () {
		
		// This constructor will be overwritten
		
	}
	
	var bet = elric.classes.BaseCapability;
	var bp = bet.prototype;
	
	/**
	 * The name/identifier of this capability
	 * Used for storing in the database
	 */
	bp.name = 'baseCapability';
	
	/**
	 * The title of this capability
	 * This should be shown in the interface instead of the name
	 */
	bp.title = 'Base Capability';
	
	/**
	 * The version of the client file
	 */
	bp.version = '2013.02.11';
	
	/**
	 * The plugin we're in
	 */
	bp.plugin = false;
	
	/**
	 * Are there client files to load?
	 */
	bp.clientFiles = 'unset';
	
	/**
	 * The pre constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.11
	 * @version  2013.02.11
	 */
	bp.preConstructor = function preConstructor () {
		this.clientFiles = 'unset';
	}
	
	/**
	 * The post constructor
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.11
	 * @version  2013.02.11
	 */
	bp.postConstructor = function postConstructor () {

		// Add a default client file if none are given
		if (this.clientFiles == 'unset') {
			this.clientFiles = [this.name];
		}
		
		if (this.clientFiles) {
			// Load all the client files
			for (var i = 0; i < this.clientFiles.length; i++) {
				elric.loadClientFile(this.clientFiles[i], this.plugin);
			}
		}
	
	}
	
}