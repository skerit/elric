/**
 * Create our Elric namespace
 */
var Elric = {}

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
