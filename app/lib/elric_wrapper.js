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
var Wrapper = Function.inherits('Alchemy.Base', 'Elric', function Wrapper() {});

/**
 * Set the 'shared group' prefix
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.3.0
 * @version  0.3.0
 */
Wrapper.setProperty('shared_group_prefix', 'elric');