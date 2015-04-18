/**
 * The Socket Client
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.0.1
 * @version  0.0.1
 */
alchemy.create('SocketClient', function ElricClientSocketClient() {

	this.title = 'Elric Client';

	this.init = function init(socket, packet) {

		pr('Emitting settings ...');
		pr(packet);

		this.submit('settings', {here: 'settings'}, function(bla) {
			pr(bla);
		});

	};

});