module.exports = function (dust, elric) {
	
	dust.helpers.getitem = function(chunk, context, bodies, params) {
		var item = params.item;
		var field = params.field;
		chunk.write(item[field]);
		return chunk;
	}
	
	dust.helpers.lilink = function (chunk, context, bodies, params) {
		
		var href = params.href;
		var dest = params.dest;
		var title = params.title;
		var active = '';
		
		var rxParam = /:\w*/g;
		var results = rxParam.exec(href);
		
		if (results !== null && results[0] !== undefined) {
			var result = results[0];
			var resultName = result.replace(':', '');
			if (params[resultName] !== undefined) {
				href = href.replace(result, params[resultName]);
			}
		}
		
		if (href == dest) {
			active = ' active';
		}
		
		chunk.write('<li class="' + active + '"><a href="' + href + '">' + title + '</a></li>');
		return chunk;
	}
	
	dust.helpers.menu = function (chunk, context, bodies, params) {
		
		var name = params.name;
		var dest = params.dest;
		var active = '';
		
		if (elric.menus[name] !== undefined) {
			var menu = elric.menus[name];
			
			for (var i in menu) {
				var link = menu[i];
				active = '';
				
				if (link.href == dest) active = ' active';
				
				chunk.write('<li class="' + active + '"><a href="' + link.href + '">' + link.title + '</a></li>');
			}
		}
		
		return chunk;
	}
	
	dust.helpers.stringify = function (chunk, context, bodies, params) {
		
		var html = '<script type="text/javascript">';
		html += 'var ' + params.name + ' = ' + JSON.stringify(params.object) + ';';
		html += '</script>';
		
		chunk.write(html);
		return chunk;
	}
	
	dust.helpers.select = function (chunk, context, bodies, params) {
		var elements = params.elements;
		var valueName = params.valueName;
		var displayName = params.displayName;
		var name = params.name;
		
		var html = '<div class="control-group">';
		html += '<select name="' + name + '">';
		
		if (params['null']) {
			html += '<option value="">' + params['null'] + '</option>';
		}
		
		for (var i in elements) {
			html += '<option value="' + elements[i][valueName] + '">' + elements[i][displayName] + '</option>';
		}
		
		html += '</select>';
		html += '</div>';
		
		chunk.write(html);
		return chunk;
	}
	
	dust.helpers.input = function (chunk, context, bodies, params) {
		
		var name = params.name;
		var placeholder = params.name;
		var pendclass = '';
		var prepend = '';
		var append = '';
		var type = 'text';
		
		if (params.prepend) {
			prepend = '<span class="add-on prepend">' + params.prepend + '</span>';
			pendclass = 'input-prepend ';
		}
		
		if (params.append) {
			append = '<span class="add-on append">' + params.append + '</span>';
			pendclass += 'input-append';
		}
		
		if (params.append || params.prepend) {
			prepend = '<div class="' + pendclass + '">' + prepend;
			append += '</div>';
		}
		
		if (params.placeholder) placeholder = params.placeholder;
		if (params.type) type = params.type;
		
		var html = '<div class="control-group">';
		html += prepend;
		html += '<input type="' + type + '" name="' + name + '" placeholder="' + placeholder + '" />';
		html += append;
		html += '</div>';
		
		chunk.write(html);
		return chunk;
	}
	
	dust.helpers.adminField = function (chunk, context, bodies, params) {
		var model = params.model;
		var name = params.name;
		var selects = params.selects;
		var blueprint = model.blueprint[name];
		var value = '';
		var html = '<div class="control-group">';
		
		if (item && field) {
			var item = params.item;
			var field = params.field;
			value = item[field];
		}
		
		var selected = '';
		
		switch (blueprint.fieldType) {
			
			case 'Select':
				html += '<select name="' + name + '">';
				var s = selects[blueprint.source.name];
				console.log(selects);
				if (blueprint.source.type == 'model') {
					for (var i in s) {
						selected = '';
						if (s[i]['_id'] == value) selected = 'selected';
						
						html += '<option value="' + s[i]['_id'] + '" ' + selected + '>' + s[i]['name'] + '</option>';
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
				html += '<input type="text" name="' + name + '" placeholder="' + name + '" />';
				break;
			
		}
		
		html += '</div>';
		
		chunk.write(html);
		return chunk;
	}
}