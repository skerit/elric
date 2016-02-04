/**
 * The Wall Element Type
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.0.1
 * @version  0.1.0
 */
var Wall = Function.inherits('ElementType', function WallElementType() {});

/**
 * A wall is a straight line
 */
Wall.setProperty('dimensions', 1);

/**
 * Colours
 */
Wall.setProperty('colour_original', '#BBCFCC');
Wall.setProperty('colour_select', '#000000');