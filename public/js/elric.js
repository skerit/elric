Elric.connected = false;
Elric.ioqueue = []
Elric.iokey = $.cookie('iokey');

// Disable the pnotify history button
$.pnotify.defaults.history = false;

/**
 * Handle the toggling of radio buttons
 */
$('div.btn-group[data-toggle-name]').each(function(){
	var group   = $(this);
	var form    = group.parents('form').eq(0);
	var name    = group.attr('data-toggle-name');
	var ef      = group.attr('data-elric-function');
	var hidden  = $('input[name="' + name + '"]', form);
	$('button', group).each(function(){
		var button = $(this);
		// When the button is clicked
		button.live('click', function(){
			var newVal = $(this).val();
			hidden.val(newVal);
			if (ef) {
				Elric[ef](newVal);
			}
		});
		// Set the starting value (from hidden element)
		if(button.val() == hidden.val()) {
			button.addClass('active');
		}
	});
});

$('#ma-notifybutton').click(function(e){
	e.preventDefault();
	var content = $('#notifications').html();
	$('#ma-notifybutton').popover({placement: 'bottom', content: content, html: true});
});

/**
 * Send data to the server,
 * store for later if no connection is available
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.05
 */
Elric.submit = function (message, type) {
	
	if (type === undefined) type = 'browserdata';
	
	if (Elric.connected) {
		Elric.socket.emit(type, message);
	} else {
		Elric.ioqueue.push({type: type, message: message});
	}
}

/**
 * Login to the server
 * 
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.05
 */
Elric.notify = function (message) {
	$.pnotify({
    title: 'Regular Notice',
    text: message
	});
	
	$('#notifications').append('<div>New:<br/>' + message + '<hr/></div>')
}

/**
 * Login to the server
 * 
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.05
 */
Elric.login = function () {
	
	var auth = {
		login: Elric.exposed.username,
		key: Elric.exposed.iokey,
		type: 'browser'
	}
	
	Elric.submit(auth, 'browserlogin');
}

// Create a connection
if (Elric.exposed.iokey) {
	Elric.socket = io.connect('http://localhost');

	// Send a login upon connect
	Elric.socket.on('connect', function (data) {
		Elric.connected = true;
		Elric.login();
	});
	
	Elric.socket.on('disconnect', function (data) {
		Elric.connected = false;
	});
	
	Elric.socket.on('message', function (data) {
		console.log(data);
		//socket.emit('my other event', { my: 'data' });
	});
	
	Elric.socket.on('notify', function (data) {
		Elric.notify(data.message);
	});
}