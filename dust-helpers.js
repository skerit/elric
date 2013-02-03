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
		var prependid = 'ma-';
		var active = '';
		var id = title.toLowerCase();
		
		if (params.id) {
			id = params.id;
		}
		
		if (params.prependid) {
			prependid = params.prependid + '-';
		}
		
		var liid = prependid + 'parent-' + id;
		
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
		
		chunk.write('<li id="' + liid + '" class="' + active + '"><a id="'+prependid+id+'" href="' + href + '">' + title + '</a></li>');
		return chunk;
	}
	
	/**
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.29
	 */
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
	
	/**
	 * Expose objects to the browser
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.01.06
	 */
	dust.helpers.expose = function (chunk, context, bodies, params) {
		
		var objects = params.objects;
		
		var propertyOf = false;
		
		if (params.namespace) propertyOf = params.namespace;
		
		var html = '<script type="text/javascript">';
		
		for (var name in objects) {
			var json = JSON.stringify(objects[name].object);
			
			if (!propertyOf) {
				html += 'var ' + name + ' = ' + json + ';';
			} else {
				html += propertyOf + '.exposed["' + name + '"] = ' + json + ';';
			}
		}
		html += '</script>';
		
		chunk.write(html);
		return chunk;
	}
	
	/**
	 * Send an object to the browser
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2012.12.29
	 * @version  2013.01.06
	 */
	dust.helpers.stringify = function (chunk, context, bodies, params) {
		
		if (params.name === undefined) return chunk;
		
		var json = JSON.stringify(params.object);
		var propertyOf = false;
		
		if (params.namespace) propertyOf = params.namespace;
		
		if (params.html == 1) {
			var html = '<p class="codeexample">';
		} else {
			var html = '<script type="text/javascript">';
		}

		if (!propertyOf) {
			html += 'var ' + params.name + ' = ' + json + ';';
		} else {
			html += propertyOf + '.exposed["' + params.name + '"] = ' + json + ';';
		}
		
		if (params.html == 1) {
			html += '</p>';
		} else {
			html += '</script>';
		}
		
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
	
	dust.helpers.doekETMenu = function (chunk, context, bodies, params) {
		
		var html = '';
		
		for (var typename in elric.memobjects.elementTypes) {
			var type = elric.memobjects.elementTypes[typename];
			
			html += '<li><a href="#" data-target="addElementType" data-elementType="' + typename + '">Add ' + type.title + '</a></li>';
			
		}
		
		chunk.write(html);
		return chunk;
	}
	
}