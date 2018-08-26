/**
 * Alchemy: a node.js framework
 * Copyright 2014-2018, Jelle De Loecker
 *
 * Licensed under The MIT License
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright 2014-2018, Jelle De Loecker
 * @link          
 * @license       MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
require('alchemymvc');

// Intercept uncaught exceptions so the server won't crash
// @todo: this should be expanded and integrated into alchemy itself
process.on('uncaughtException', function onException(error) {
	// Indicate we caught an exception
	alchemy.printLog('error', ['Uncaught Exception!', String(error), error], {err: error, level: -2});
});

process.on('unhandledRejection', function onRejection(error, promise) {
	// Indicate we caught a rejection
	alchemy.printLog('error', ['Uncaught Promise Rejection!', String(error), error], {err: error, level: -2});
});

alchemy.start(function onAlchemyReady() {

	// Do certain things when alchemy is ready

});

