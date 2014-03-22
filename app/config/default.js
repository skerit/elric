module.exports = {
	
	// The port to run the server on
	port: 3000,
	
	// Gzip/deflate compression
	compression: true,
	
	// Decode json, multipart, urlencode in body
	decoding: true,

	// Detect when this node server is too busy
	// 70ms is the default, and would result in a 200ms latency lag
	toobusy: 70,
	
	// Use cookies
	cookies: 'cookie_key_or_false_to_disable',
	
	// Type of sessions to use: 'server', 'cookie', 'persistent'
	sessions: 'cookie',

	// The session key (for server & persistent sessions)
	sessionKey: 'session_key',
	
	// Enable hawkejs on the client side
	hawkejsClient: true,
	
	// Disable debugging
	debug: false,
	
	// Enable debug stack trace (slow)
	logTrace: false,
	
	// Enable debugTrace for log.debug calls
	logTraceDebug: true,
	
	// Enable debugTrace for log.error calls
	logTraceError: true,
	
	// Listen to logTrace by default
	logTraceInfo: null,
	logTraceWarn: null,
	logTraceVerbose: null,

	// Restart server on file changes
	restartOnFileChange: false,
	
	// Set the debug level
	logLevel: 4
	
};