/**
 *
 * Alchemy: Node.js MVC Framework
 * Copyright 2013-2013
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright   Copyright 2013-2013
 * @since       0.0.1
 * @license     MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
alchemy.usePlugin('styleboost');
alchemy.usePlugin('jquery');
alchemy.usePlugin('select2');
alchemy.usePlugin('jsoneditor');
alchemy.usePlugin('i18n');
alchemy.usePlugin('acl');
alchemy.usePlugin('menu');
alchemy.usePlugin('chimera', {});

alchemy.usePlugin('elric-elro');

// Send the menu options to the client
alchemy.on('alchemy.render', function(settings, callback) {

	// Only send this data on the initial pageload
	if (!settings.ajax) {

		var path = '/public/scripts/elric.js';

		if (!settings.payload.request) {
			settings.payload.request = {};
		}

		if (!settings.payload.request.tags) {
			settings.payload.request.tags ={};
		}

		// Add the CDN script
		settings.payload.request.tags[path] = {
			type: 'script',
			path: path,
			block: 'head',
			order: 1000,
			suborder: 1000
		};
	}

	callback();
});