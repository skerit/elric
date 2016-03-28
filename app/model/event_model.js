var all_events = alchemy.shared('elric.event');

/**
 * The Event Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Event = Model.extend(function EventModel(options) {
	EventModel.super.call(this, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Event.constitute(function addFields() {

	// Event type
	// @TODO: Make Enum
	this.addField('type', 'Enum', {values: all_events});

	// The event data
	this.addField('payload', 'Object');

	this.Document.setFieldGetter('event', function getEvent() {
		if (all_events[this.type]) {
			return new all_events[this.type](this);
		}
	});
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Event.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('created');
	list.addField('type');
});