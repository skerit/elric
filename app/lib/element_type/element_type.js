/**
 * The ElementType class
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var ElementType = Function.inherits('Elric.Wrapper', function ElementType() {});

/**
 * This is a wrapper class
 */
ElementType.setProperty('is_abstract_class', true);

/**
 * This wrapper class starts a new group
 */
ElementType.setProperty('starts_new_group', true);

/**
 * The dimensions this element type has
 * 0 = a single dot
 * 1 = a line
 * 2 = any
 */
ElementType.setProperty('dimensions', 2);

/**
 * Colours
 */
ElementType.setProperty('colour_original', '#000000');
ElementType.setProperty('colour_hover', '#909090');
ElementType.setProperty('colour_select', '#500000');

/**
 * What model to use for selects
 */
ElementType.setProperty('model', false);

/**
 * Return the basic record for JSON
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
ElementType.setMethod(function toJSON() {
	return {
		dimensions: this.dimensions,
		colour_original: this.colour_original,
		colour_hover: this.colour_hover,
		colour_select: this.colour_select,
		model: this.model,
		title: this.title
	}
});