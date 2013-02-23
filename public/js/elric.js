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

Elric.createSelect = function createSelect ($object) {
	
	var type = $object.attr('data-source-type');
	var name = $object.attr('data-source-name');

	$.post('/api/data/set/' + type + '/' + name, {format: 'array'}, function (recordset){

		$object.select2({
			query: function (query) {
				
				var data = {results: []};
				var search = query.term;
				
				for (var i = 0; i < recordset.length; i++) {
					if (recordset[i].text.indexOf(search) == 0) {
						data.results.push(recordset[i]);
					}
				}
				
				// If the search string isn't empty, add it as a "new" value
				if (search) {
					data.results.push({id: search, text: 'New value: ' + search});
				}
				
				query.callback(data);
			},
			initSelection: function (element, callback) {
				
				var set_id = element.val();
				var set_value = false;
				
				for (var i in recordset) {
					if (recordset[i].id == set_id) set_value = recordset[i];
				}
				
				if (!set_value) {
					set_value = {id: set_id, text: 'Custom value: ' + set_id};
				}
				
        callback(set_value);
			}
		});
		
	}, 'json');
	
//	$("#e10_2").select2({
//    data:{ results: data, text: 'tag' },
//    formatSelection: format,
//    formatResult: format
//	});
//	
	/*
	$object.select2({
		//placeholder: "Search for a movie",
		minimumInputLength: 0,
		ajax: { // instead of writing the function to execute the request we use Select2's convenient helper
				url: '/api/data/set/' + type + '/' + name,
				type: 'POST',
				dataType: 'json',
				data: function (term, page) {return {format: 'array'};},
				results: function (data, page) { // parse the results into the format expected by Select2.
						// since we are using custom formatting functions we do not need to alter remote JSON data
						console.log(data);
						return {results: data, text: 'title'};
				}
		},
		/*initSelection: function(element, callback) {
				// the input tag has a value attribute preloaded that points to a preselected movie's id
				// this function resolves that id attribute to an object that select2 can render
				// using its formatResult renderer - that way the movie name is shown preselected
				var id=$(element).val();
				if (id!=="") {
						$.ajax("http://api.rottentomatoes.com/api/public/v1.0/movies/"+id+".json", {
								data: {
										apikey: "ju6z9mjyajq2djue3gbvv26t"
								},
								dataType: "jsonp"
						}).done(function(data) { callback(data); });
				}
		},*/
		/*formatResult: function (object, container, query){
			console.log('One item to format:')
			console.log(object);
		}, // omitted for brevity, see the source of this page
		//formatSelection: movieFormatSelection,  // omitted for brevity, see the source of this page
		dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
		escapeMarkup: function (m) { return m; } // we do not want to escape markup since we are displaying html in results
	});*/
	
}

/**
 * Enable device buttons
 * @todo: This is a proof of concept, this code needs to be reworked
 */
hawkejs.event.on('create:template[page/devices]-block[container-fluid]', function (blockname){
	
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
hawkejs.event.on('create:block[sidebar]', function (blockname, origin_template_name) {
	
	// Recapture the new sidebar
	$sidebar = $('#sidebar .wrapper');
	
	// Reload scrollpane
	$sidebar.jScrollPane();
	
});

/**
 * Apply timeago to new elements in the fluid container
 */
hawkejs.event.on('create:block[container-fluid]', function (blockname, origin_template_name){
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
