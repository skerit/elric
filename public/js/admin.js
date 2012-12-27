$('#addNew').click(function(e) {
	e.preventDefault();
	var model = $(this).attr('data-model');
	window.location = '/admin/' + model + '/add';
});

$('#saveNew').click(function(e) {
	e.preventDefault();
	var model = $(this).attr('data-model');
	
	var newRecord = $('#newRecord').jsonify();
	$('#error').html('');
	$('.control-group').removeClass('error');
	
	$.post('/admin/' + model + '/add', newRecord, function(data) {
		if (data.error) {
			$('#error').html('<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Warning!</strong> Adding new record failed!</div>');
			for (var input in data.errors.errors) {
				$('[name="' + input + '"]').parent().addClass('error');
			}
		} else if (data.redirect) {
			window.location = data.redirect;
		}
	});
	
});

$('#saveEdit').click(function(e) {
	e.preventDefault();
	var model = $(this).attr('data-model');
	var id = $(this).attr('data-id');
	var saveRecord = $('#saveRecord').jsonify();
	$('#error').html('');
	$('.control-group').removeClass('error');
	
	$.post('/admin/' + model + '/edit/' + id, saveRecord, function(data) {
		if (data.error) {
			$('#error').html('<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Warning!</strong> Updating record failed!</div>');
			for (var input in data.errors.errors) {
				$('[name="' + input + '"]').parent().addClass('error');
			}
		} else if (data.redirect) {
			window.location = data.redirect;
		}
	});
	
});

$('.editButton').click(function(e) {
	e.preventDefault();
	
	var model = $(this).attr('data-model');
	var id = $(this).attr('data-id');
	
	window.location = '/admin/' + model + '/edit/' + id;
	
});