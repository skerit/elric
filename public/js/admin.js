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