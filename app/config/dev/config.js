/**
 * Dev Environment configuration:
 * these settings override the default.js and can be overridden by local.js
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright   Copyright 2013-2018
 * @since       0.1.0
 * @license     http://www.opensource.org/licenses/mit-license.php MIT License
 */
module.exports = {

	// Disable cache
	cache: false,

	// Enable debugging
	debug: true,

	// Allow access to the info page
	info_page: true,

	// Kill the process when a file changes
	kill_on_file_change: true,

	// Enable debug stack trace
	log_trace: true,

	// Disable CSS minification
	minify_css: false,

	// Disable JS minification
	minify_js: false
};