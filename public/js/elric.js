Elric.connected = false;
Elric.ioqueue = []
Elric.iokey = $.cookie('iokey');
Elric.$notify = $('#notifybutton');

// Disable the pnotify history button
$.pnotify.defaults.history = false;

// Elric storage
Elric.storage = {};

// Activate the popover
Elric.$notify.popover({placement: 'bottom', content: 'No notifications found', html: true});

// Store the notification popover in here
Elric.notifications = {};
Elric.notifications.popover = Elric.$notify.data('popover');
Elric.notifications.messages = Elric.exposed.notifications;

Elric.$notify.click(function(e){
	e.preventDefault();
	Elric.$notify.popover({placement: 'bottom'});
});

/**
 * Make the content div fill the body
 */
$(document).ready(function() {
	$('#content').css('min-height', ($('html').height() - $('#topbar').height()));
});

/**
 * Send data to the server,
 * store for later if no connection is available
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.05
 */
Elric.submit = function (message, type) {
	
	if (type === undefined) type = 'data';
	
	var packet = {type: type, message: message};
	
	if (Elric.connected) {
		Elric.socket.emit('browser', packet);
	} else {
		Elric.ioqueue.push({type: type, message: message});
	}
}

/**
 * Show the user a notifications we received from the server
 * 
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.05
 * @version  2013.01.16
 */
Elric.notify = function (message) {
	
	// Link to the notifications
	var n = Elric.notifications;
	
	// Remove the first element if there are too many messages
	if (n.messages.length > 6) n.messages.shift();
	
	// Notify us of the new message
	$.pnotify({
    title: 'Regular Notice',
    text: message
	});
	
	// Add the new message to the array
	var obj = {message: message};
	n.messages.push(obj);
	
	
}

/**
 * Repopulate the notifications in the popover
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.05
 * @version  2013.01.16
 */
Elric.repopulateNotifications = function () {
	
	// Link to the notifications
	var n = Elric.notifications;
	
	// Link to the popover options
	var o = n.popover.options;
	
	// Clear the popover content
	o.content = '';
	
	for (var i in n.messages) {
		o.content += '<div>New:<br/>' + n.messages[i].message + '<hr/></div>';
	}
	
	// If the popover is open at this time, also replace that data
	$('.popover-inner .popover-content',
		Elric.$notify.siblings('div.popover')).html(o.content);
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
	
	Elric.submit(auth, 'login');
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

	});
	
	Elric.socket.on('notify', function (data) {
		Elric.notify(data.message);
	});
}

Elric.repopulateNotifications();

var $sidebar = $('#sidebar .wrapper');
var $window = $(window);

/**
 * Enable device buttons
 * @todo: This is a proof of concept, this code needs to be reworked
 */
hawkejs.event.on('create-block-device-hack', function (blockname){
	
	$('.devicecommand').click(function(e) {
		
		var $button = $(this);
		
		var deviceid = $button.attr('data-deviceid');
		var command = $button.attr('data-command');
		var command_type = $button.attr('data-command-type');
		
		$.post('/devices/command/' + deviceid, {command_type: command_type, command: command}, function(data) {
			// Do something with the return data
		});
	});
	
});

/**
 * Apply the jScrollPane plugin to every sidebar
 */
hawkejs.event.on('create-block-sidebar', function (blockname){
	
	// Recapture the new sidebar
	$sidebar = $('#sidebar .wrapper');
	
	// Reload scrollpane
	$sidebar.jScrollPane();
	
});

/**
 * Apply timeago to new elements in the fluid container
 */
hawkejs.event.on('create-block-container-fluid', function (blockname){
	$("#content .container-fluid .timeago").timeago();
});

$window.load(function () {
	
	var resize = false;
		
	$window.resize(function() {
		// Reload when the window changes size
		if (resize) {
			clearTimeout(resize);
		}
		resize = setTimeout(function(){$sidebar.jScrollPane();}, 100);
	});
});
