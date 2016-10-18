var libpath = alchemy.use('path'),
    fs = alchemy.use('fs');

/**
 * The Soundbite Model
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Soundbite = Model.extend(function SoundbiteModel(options) {
	SoundbiteModel.super.call(this, options);
});

/**
 * Constitute the class wide schema
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Soundbite.constitute(function addFields() {

	var types = {

		// Ambient noised
		ambient   : 'Ambient',

		// Blips and bloops
		interface : 'Interface',

		// Speech and moans
		voice     : 'Voice',

		// Music
		music     : 'Music'
	};

	// The pack it belongs to
	this.belongsTo('Soundpack');

	// It can have many tags
	this.hasAndBelongsToMany('Tag');

	// The filename
	this.addField('filename', 'String');

	// The transcript of this soundbyte
	this.addField('transcript', 'String');

	// The confidence of the speech-to-text result
	this.addField('confidence', 'Number');

	// Has this been approved by the user
	this.addField('approved', 'Boolean');
});

/**
 * Configure chimera for this model
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Soundbite.constitute(function chimeraConfig() {

	var list,
	    edit;

	if (!this.chimera) {
		return;
	}

	// Get the list group
	list = this.chimera.getActionFields('list');

	list.addField('soundpack_id');
	list.addField('filename');
	list.addField('transcript');
	list.addField('confidence');

	// Get the edit group
	edit = this.chimera.getActionFields('edit');

	edit.addField('soundpack_id');
	edit.addField('filename');
	edit.addField('transcript');
	edit.addField('confidence');
});
