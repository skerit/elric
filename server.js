// Intercept uncaught exceptions so the server won't crash
process.on('uncaughtException', function onError(error) {
	// Indicate we caught an exception
	alchemy.printLog('error', ['Uncaught Exception!', String(error), error], {err: error, level: -2});
});

//require('heapdump');

require('alchemymvc');

// Configure this as an elric master service
alchemy.configureService('elric::master');

// Start the alchemy server
alchemy.start(function onAlchemyReady() {

	//Classes.Alchemy.Command.execute('Test', function(){});

	Model.get('Client').findById('55eda64331bcb50e54bdddda', function gotClient(err, record) {
		console.log('Client:', record, record.ClientCapability);

		let cap = record.getCapability('mediaconversion');
		let cap2 = record.getCapability('mediaconversion');

		console.log(cap.capability == cap2.capability);

		console.log('Mediacap', cap, '==', cap2, cap == cap2)
	});

});

alchemy.utest = function utest() {
	Model.get('Client').findById('5777d36e49e5629950201301', function gotClient(err, record) {
		console.log('Sending update:', err, record.Client);
		alchemy.updateData('5777d36e49e5629950201301', record.Client);
	});
}