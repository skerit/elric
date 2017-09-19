/**
 * The Browser Capability
 *
 * @constructor
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Browser = Function.inherits('Elric.Capability', function BrowserCapability() {
	BrowserCapability.super.call(this);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Browser.constitute(function addFields() {

	var values = {
		'chromium-browser' : 'Chromium',
	};

	this.schema.addField('browser', 'Enum', {values: values});
	this.schema.addField('homepage', 'String');
});