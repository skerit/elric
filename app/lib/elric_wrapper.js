/**
 * The Elric Wrapper class,
 * basis for most special classes
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Wrapper = Function.inherits('Informer', 'Elric', function Wrapper() {});

/**
 * Set basic behaviour
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Wrapper.constitute(function setBasicBehaviour() {

	var shared_group,
	    group_name,
	    regex,
	    title,
	    name;

	// Do not let children inherit the extend_only setting
	if (this.prototype.hasOwnProperty('extend_only')) {

		// Do nothing further if this is meant to be extended only
		if (this.prototype.extend_only) {

			if (this.prototype.hasOwnProperty('starts_new_group') && this.prototype.starts_new_group !== false) {

				// This wrapper starts a new group
				this.setProperty('group_parent', this.name);

				// If no group name has been defined, create one
				if (!this.prototype.hasOwnProperty('group_name')) {
					group_name = this.name.underscore();
					this.setProperty('group_name', group_name);
				} else {
					group_name = this.prototype.group_name;
				}

				// Set the group on the class itself
				this.setStatic('group', alchemy.shared('elric.' + group_name));
			}

			return;
		}
	} else {
		this.setProperty('extend_only', false);
		this.setProperty('starts_new_group', false);
	}

	// Get the name this class might need to be grouped under
	group_name = this.prototype.group_name;

	// Do nothing further if there is no group name
	if (!group_name) {
		return;
	}

	// Get the shared group object
	shared_group = alchemy.shared('elric.' + group_name);

	// Construct the regex to get the name
	regex = RegExp.interpret('/' + group_name + '$|' + this.prototype.group_parent + '$/');

	// Get the name (without the parent name)
	name = this.name.replace(regex, '');

	// See if the type_name needs to be set automatically
	if (!this.prototype.hasOwnProperty('type_name')) {
		this.setProperty('type_name', name.underscore());
	}

	// Do the same for the title
	if (!this.prototype.hasOwnProperty('title')) {
		this.setProperty('title', name.titleize());
	}

	// Set the title on the class itself
	this.setStatic('title', this.prototype.title);

	// Add this class to the shared group
	shared_group[this.prototype.type_name] = this;
});

/**
 * Find a member of this group
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Wrapper.setStatic(function getMember(name) {

	// See if it can be found by the exact name given
	if (this.group[name]) {
		return this.group[name];
	}

	// Try underscoring the name otherwise
	name = name.underscore();

	if (this.group[name]) {
		return this.group[name];
	}
});