$('#hawkejs-space-admin-main').on('click', '#addNew', function(e) {
	e.preventDefault();
	var model = $(this).attr('data-model');
	goToAjaxViewWithHistory('/admin/' + model + '/add');
});

$('#hawkejs-space-admin-main').on('click', '#saveNew', function(e) {
	e.preventDefault();
	var model = $(this).attr('data-model');
	
	var newRecord = $('#newRecord').jsonify();
	$('#error').html('');
	$('.control-group').removeClass('error');
	
	$.post('/admin/' + model + '/add', newRecord, function(data) {
		if (data.error) {
			var herror = '<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button><h4 class="alert-heading">' + data.error + '</h4>';
			if (data.errors !== undefined) {
				var errors = data.errors;
				herror += '<br/>' + errors.message;
				herror += '<br/> Name: <b>' + errors.name + '</b> Type: <b>' + errors.type + '</b> - Value: <b>' + errors.value + '</b> Path: <b>' + errors.path + '</b>';
			}
			herror += '</div>';
			$('#error').html(herror);
			for (var input in data.errors.errors) {
				$('[name="' + input + '"]').parent().addClass('error');
			}
		} else if (data.redirect) {
			goToAjaxViewWithHistory(data.redirect);
		}
	});
	
});

$('#hawkejs-space-admin-main').on('click', '#saveEdit', function(e) {
	e.preventDefault();
	
	var $this = $(this);
	var model = $this.attr('data-model');
	var id = $this.attr('data-id');
	
	var saveRecord = $('#saveRecord').jsonify();
	$('#error').html('');
	$('.control-group').removeClass('error');
	
	$.post('/admin/' + model + '/edit/' + id, saveRecord, function(data) {
		if (data.error) {
			var herror = '<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button><h4 class="alert-heading">' + data.error + '</h4>';
			if (data.errors !== undefined) {
				var errors = data.errors;
				herror += '<br/>' + errors.message;
				herror += '<br/> Name: <b>' + errors.name + '</b> Type: <b>' + errors.type + '</b> - Value: <b>' + errors.value + '</b> Path: <b>' + errors.path + '</b>';
			}
			herror += '</div>';
			$('#error').html(herror);
			for (var input in data.errors.errors) {
				$('[name="' + input + '"]').parent().addClass('error');
			}
		} else if (data.redirect) {
			goToAjaxViewWithHistory(data.redirect);
		}
	});
	
});

$('#hawkejs-space-admin-main').on('click', '.editButton', function(e) {
	e.preventDefault();
	
	var $this = $(this);
	var model = $this.attr('data-model');
	var id = $this.attr('data-id');
	
	goToAjaxViewWithHistory('/admin/' + model + '/edit/' + id);
	
});

hawkejs.event.on('create:block[admin-main]', function() {
	
	// Add listeners for linked fields
	$('[data-linked-value-change-type]').each(function(){
		var $this = $(this);
		
		var on_type = $this.attr('data-linked-value-change-type');
		var on_name = $this.attr('data-linked-value-change-name');
		var on_path = $this.attr('data-linked-value-path');
		
		var path = JSON.parse(unescape(on_path));
		
		var on_source = {};
		
		try {
			on_source = Elric.exposed['admin-' + path[0].name];
		} catch (err) {
			console.error('Problem finding data');
		}
		
		// For now, only field is supported
		if (on_type == 'field') {
			
			var $on_field = $('form[data-model] [name="' + on_name + '"]');
			
			$on_field.change(function() {
				var $on_this = $(this);
				var on_value = $on_this.val();
				
				// Set the begin source
				var temp_source = on_source;
				
				if (typeof on_value != 'undefined') {
					
					var final_value = on_value;
					
					var i = 1;
					
					for (i = 1; i < path.length; i++) {
						var ps = path[i];
						
						if (typeof ps == 'object') {
							if (ps.type == 'field') {
								// Get the value of this field
								if (ps.name == on_name) {
									var temp_value = on_value;
								} else {
									// Look for the other field value
									console.error('Not yet implemented!');
								}
								temp_source = temp_source[temp_value];
							}
						} else {
							temp_source = temp_source[ps];
						}
						
						final_value = temp_source;
						
					}
					
				}
				
				$this.val(final_value);
				
			});
			
			// Trigger a first change
			$on_field.change();
			
		}
		
	});
	
});