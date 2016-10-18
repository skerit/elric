/**
 * The Client Element Type
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Client = Function.inherits('Elric.ElementType', function ClientElementType() {});

// A client is a single point
Client.setProperty('dimensions', 0);

Client.setProperty('colour_original', '#303030');
Client.setProperty('colour_hover', '#572727');
Client.setProperty('colour_select', '#A80000');

// Use the client model for selects
Client.setProperty('model', 'Client');

/**
 * Get external ids
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Client.setMethod(function getExternalIds(callback) {

	var C = Model.get('Client');

	C.find('dict', {fields: ['_id', 'hostname']}, function gotList(err, result) {
		callback(err, result);
	});
});