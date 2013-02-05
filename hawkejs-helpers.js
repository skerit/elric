
module.exports = function elricHawkejsHelpers (hawkejs) {
	
	// Helpers link
	var helpers = hawkejs.helpers;
	
	/**
	 * Generate an admin field
	 */
	helpers.adminField = function (name, options) {
		
		var modelBlueprint = options.blueprint;
		var blueprint = modelBlueprint[name];

		var selects = options.selects;
		
		options.field = name;
		
		var title = name;
		
		if (options.title) {
			title = options.title;
		}
		
		var value = '';
		var html = '<div class="control-group">';
		
		if (options.label == 1) {
			html += '<label class="control-label" for="' + name + '">' + title + '</label>';
		}
		
		html += '<div class="controls">';
		
		if (options.items && options.ofItem && options.field) {
			options.item = options.items[options.ofItem];
		}
		
		if (options.item && options.ofItem2) {
			if (options.item[options.ofItem2] !== undefined) {
				options.item = options.item[options.ofItem2];
			} else {
				options.item = false;
			}
		}
		
		if (options.item && options.field) {
			var item = options.item;
			var field = options.field;
			
			if (item[field] === undefined) {
				value = '';
			} else {
				value = item[field];
			}
		}
		
		var selected = '';
		
		switch (blueprint.fieldType) {
			
			case 'Select':
				html += '<select name="' + name + '">';
				var s = selects[blueprint.source.name];

				if (blueprint.source.type == 'model') {
					for (var i in s) {
						selected = '';
						if (s[i]['_id'] == value) selected = 'selected';
						
						var oname = '';
						
						if (s[i]['title']) {
							oname = s[i]['title'];
						} else if (s[i]['name']) {
							oname = s[i]['name'];
						} else {
							oname = 'Nameless: ' + s[i]['_id'];
						}
						
						html += '<option value="' + s[i]['_id'] + '" ' + selected + '>' + oname + '</option>';
					}
				} else if (blueprint.source.type == 'memobject') {
					for (var i in s) {
						selected = '';
						if (s[i]['_id'] == value) selected = 'selected';
						
						html += '<option value="' + s[i]['name'] + '"' + selected + '>' + s[i]['title'] + '</option>';
					}
				}
				html += '</select>';
				break;
			
			default:
				html += '<input type="text" name="' + name + '" placeholder="' + title + '" value="' + value + '" />';
				break;
		}
		
		html += '</div></div>';
		
		this.scope.buf.push(html);
	}
	
	
}