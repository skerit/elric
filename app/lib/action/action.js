/**
 * The Base Action class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {EventDocument}   document   The (not necesarily saved) document
 */
var Action = Function.inherits('Elric.Wrapper', function Action(document) {

	var payload;

	if (!document) {
		throw new Error('Actions must be provided with a document');
	}

	// Store the document
	this.document = document;

	// Get the payload
	payload = this.document.payload;

	// If no payload exists, create it now
	if (!payload) {
		payload = this.schema.process();
		this.document.payload = payload;
	}

	// Store the payload on the event
	this.payload = payload;
});

/**
 * This is a wrapper class
 */
Action.setProperty('extend_only', true);

/**
 * This wrapper class starts a new group
 */
Action.setProperty('starts_new_group', true);

/**
 * Return the class-wide schema
 *
 * @type   {Schema}
 */
Action.setProperty(function schema() {
	return this.constructor.schema;
});

/**
 * Set the event schema
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Action.constitute(function setSchema() {

	var schema;

	// Create a new schema
	schema = new alchemy.classes.Schema(this);
	this.schema = schema;

	// Every event has a start and end property
	schema.addField('start', 'Datetime', {'default': Date.create});
	schema.addField('end', 'Datetime', {'default': null});
});

/**
 * Set the originating event
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Action.setMethod(function setEvent(event) {

	if (!event) {
		return null;
	}

	// Set the event object
	this.event = event;

	// Set the event id
	this.document.from_event_id = event._id;
});

/**
 * Set the originating scenario
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Action.setMethod(function setScenario(scenario) {

	if (!scenario) {
		return null;
	}

	// Set the event object
	this.scenario = scenario;

	// Set the event id
	this.document.from_scenario_id = scenario._id;
});

/**
 * Start executing the action
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Action.setMethod(function startExecution(callback) {

	this.setStartTime();

	this.execute(callback);
});

/**
 * Set event specific data,
 * should only be called for new events.
 * Return false if the event should not be fired
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Action.setMethod(function execute() {
	throw new Error('Descendants should create their own execute method');
});

/**
 * Set the start time
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Action.setMethod(function setStartTime(date) {

	if (!date) {
		date = new Date();
	}

	this.document.payload.start = date;
});

/**
 * Set the end time
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Action.setMethod(function setEndTime(date) {

	if (!date) {
		date = new Date();
	}

	this.document.payload.end = date;
});

/**
 * Save the event document
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    1.0.0
 * @version  1.0.0
 */
Action.setMethod(function save(callback) {
	return this.document.save(callback);
});