// Elric.exposed.workingclient
// Elric.exposed.capsettings

Elric.cap = {};

/**
 * Enable or disable this capability
 * Show it in the browser and possibly send to command to the server
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.06
 * @version  2013.01.06
 */
Elric.cap.toggle = function (capname, enable, ajax) {
	
	if (enable == 'enable') enable = true;
	if (enable == 'disable') enable = false;
	if (ajax === undefined) ajax = true;
	
	var $cap = $('.box[data-capability="' + capname + '"]');
	var capset = Elric.exposed.capsettings[capname];
	
	if (enable) {
		$('button[data-toggle="disable"]', $cap).show();
		$('button[data-toggle="enable"]', $cap).hide();
		
		$('div.edit-settings', $cap).show();
	} else {
		$('button[data-toggle="disable"]', $cap).hide();
		$('button[data-toggle="enable"]', $cap).show();
		
		$('div.edit-settings', $cap).hide();
	}
	
	// Inform the server
	if (ajax) {
		$.post('/clients/enable/' + Elric.exposed.workingclient + '/' + capname, {enabled:enable}, function(data) {
			// Do something with the return data
		});
	}
}

// Make the "enable" and "disable" buttons do what they're supposed to
$('#hawkejs-space-client-main').on('click', 'button[data-function="toggle"]', function (e) {
	e.preventDefault();
	var $this = $(this);
	var toggle = $this.attr('data-toggle');
	var capname = $this.attr('data-capability');
	
	Elric.cap.toggle(capname, toggle, true);
});

$('#hawkejs-space-client-main').on('click', 'button[data-function="save"]', function (e) {
	e.preventDefault();
	var $this = $(this);
	var capname = $this.attr('data-capability');
	
	var saverecord = $('#capform-' + capname).jsonify();
	
	$.post('/clients/save/' + Elric.exposed.workingclient + '/' + capname, saverecord, function(data) {
		// Do something with the return data
	});
	
});

/**
 * Get client capability settings upon each render
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.04
 * @version  2013.02.04
 *
 */
Elric.viewClient = function viewClient (parameters) {
	// Set the initial states
	for (var capname in Elric.exposed.capsettings) {
		
		var $cap = $('[data-capability="' + capname + '"]');
		var capset = Elric.exposed.capsettings[capname];
		
		// If this capability has been enabled ...
		if (capset.enabled) {
			Elric.cap.toggle(capname, true, false);
		}
	}
}

// Parse the client capabilities on block creation
hawkejs.event.on('create:block[client-main]', Elric.viewClient);
