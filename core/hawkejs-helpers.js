
module.exports = function elricHawkejsHelpers (hawkejs) {
	
	// Helpers link
	var helpers = hawkejs.helpers;
	
	/**
	 * Generate an admin field (old style)
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.06
	 * @version  2013.02.13
	 *
	 * @param    {string}    name     The name of the field
	 * @param    {object}    options  The options
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
		var linked_value_attributes = '';
		
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
		
		// Do we need to get the value from somewhere?
		if (typeof blueprint.value != 'undefined') {
			linked_value_attributes += 'data-linked-value-change-type="' + blueprint.value.on.type + '" ';
			linked_value_attributes += 'data-linked-value-change-name="' + blueprint.value.on.name + '" ';
			linked_value_attributes += 'data-linked-value-path="' + escape(JSON.stringify(blueprint.value.path)) + '" ';
		}
		
		var selected = '';
		
		switch (blueprint.fieldType.toLowerCase()) {
			
			case 'select':
				html += '<select name="' + name + '" ' + linked_value_attributes + '>';
				var s = selects[blueprint.source.name];
				
				// Add an empty value if the field is not required
				if (!blueprint.required) {
					html += '<option value=""></option>';
				}

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
						
						html += '<option value="' + s[i]['_id'] + '" ' + selected + '>' + helpers.encode(oname) + '</option>';
					}
				} else if (blueprint.source.type == 'memobject') {
					for (var i in s) {
						
						selected = '';
						if (s[i]['name'] == value) selected = 'selected';
						
						var iopt = '<option value="' + s[i]['name'] + '" ' + selected + '>' + s[i]['title'] + '</option>';

						html += iopt;
					}
				}
				html += '</select>';
				break;
			
			case 'json':
				html += '<input type="text" name="' + name + '" placeholder="' + title + '" value="' + helpers.encode(JSON.stringify(value)) + '" ' + linked_value_attributes + ' />';
				break;
			
			default:
				html += '<input type="text" name="' + name + '" placeholder="' + title + '" value="' + helpers.encode(value) + '" '  + linked_value_attributes + ' />';
				break;
		}
		
		html += '</div></div>';
		
		this.scope.buf.push(html);
	}
	
	/**
	 * Create a field based on blueprint settings
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.23
	 * @version  2013.02.23
	 *
	 * @param    {Object}    blueprint   The field blueprint
	 *
	 * @returns  {String}    The html
	 */
	helpers.blueprintField = function blueprintField (name, options) {
		
		if (typeof options.blueprint == 'undefined') return '';
		if (typeof options.return == 'undefined') options.return = false;
		
		var html = '';
		var blueprint = options.blueprint;
		var construct = {};
		
		construct.return = true;
		
		// Add source info, for where to get the elements of this field
		if (blueprint.source) {
			construct.sourceType = blueprint.source.type;
			construct.sourceName = blueprint.source.name;
		}
		
		// Add custom attributes
		if (options.attributes) construct.attributes = options.attributes;
		
		if (typeof options.value != 'undefined') construct.value = options.value;
	
		html = hawkejs.helpers.fieldSelect(name, construct);
	
		if (options.return) return html;
		
		this.scope.buf.push(html);
	}
	
	/**
	 * Get an option for a select field
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.23
	 * @version  2013.02.23
	 *
	 * @param    {Object}    options  The options
	 *
	 * @returns  {String}    The html
	 */
	helpers.selectOption = function selectOption (element, options) {
		
		// Do nothing if the options isn't defined
		if (typeof options == 'undefined') options = {};
		
		// Set the _id as default value field
		if (typeof options.valueField == 'undefined') options.valueField = '_id';
		
		// Set the name as default name field
		if (typeof options.titleField == 'undefined') options.titleField = 'title';
		
		var cur_option_value;
		var html = '';
		
		if (options.valueField) {
			cur_option_value = element[options.valueField]
		} else {
			// If valueField is explicitly false, the value is the key
			cur_option_value = options._value;
		}
		
		// Reset the selected attribute
		selected = '';
		
		// Check given value?
		if (options.value !== false) {
			if (cur_option_value == options.value) selected = 'selected';
		}
		
		opttitle = '';
		
		if (options.titleField) {
			if (typeof element[options.titleField] != 'undefined') {
				opttitle = element[options.titleField];
			} else if (typeof element['name'] != 'undefined') {
				opttitle = element['name'];
			} else if (typeof element['title'] != 'undefined') {
				opttitle = element['title'];
			} else {
				opttitle = element[options.valueField];
			}
		} else {
			// If titleField is explicitly false, the title is the value
			opttitle = element;
		}

		html += '<option value="'
			+ cur_option_value
			+ '" ' + selected + '>'
			+ opttitle + '</option>\n';
			
		return html;
	}
	
	/**
	 * Create a select field
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.06
	 * @version  2013.02.23
	 *
	 * @param    {string}    name     The name of the field
	 * @param    {object}    options  The options
	 */
	helpers.fieldSelect = function fieldSelect (name, options) {
		
		var html = '';
		var title = false;
		var selected = '';
		var option = false;
		var opttitle = false;
		
		// Do nothing if the options isn't defined
		if (typeof options == 'undefined') return;
		
		// There is no select without elements
		if (typeof options.elements == 'undefined'
		    && typeof options.sourceName == 'undefined') return;
		
		// Add control group wrappers by default
		if (typeof options.wrapper == 'undefined') options.wrapper = true;
		
		// Do not return, but print out by default
		if (typeof options.return == 'undefined') options.return = false;
		
		// Enable a null parameter by default
		if (typeof options.null == 'undefined') options.null = true;
		
		// Check for value to select
		if (typeof options.value == 'undefined') options.value = false;
		
		// Don't add a label by default
		if (typeof options.label == 'undefined') options.label = false;
		
		// Enable a title by default
		if (typeof options.title == 'undefined') options.title = true;
		
		// There are no extra attributes by default
		if (typeof options.attributes == 'undefined') options.attributes = {};
		
		// This is a select field by default (select2 used hidden inputs)
		var elementType = 'select';
		
		// If no elements are given, but we do have a sourceName,
		// then we'll get the data via ajax.
		if (!options.elements && options.sourceName) {
			
			if (typeof options.sourceType == 'undefined') {
				options.sourceType = 'model';
			}
			
			// We're going to use select2, so the source element is an input
			elementType = 'input';
			
			options.elements = [];
			options.attributes['data-source-type'] = options.sourceType;
			options.attributes['data-source-name'] = options.sourceName;
			options.attributes['data-plugin'] = 'select2';
			options.attributes['type'] = 'hidden';
			
			if (options.null && options.null !== true) {
				options.attributes['placeholder'] = options.null;
			}
			
			if (options.value) options.attributes['value'] = hawkejs.helpers.encode(options.value);
		}
		
		// See what title to add
		if (options.title) {
			if (options.title !== true) {
				title = options.title;
			} else {
				title = name;
			}
		}
		
		// Start creating the select
		html = '<' + elementType + ' name="' + name + '" '
		
		for (var attribute_name in options.attributes) {
			html += attribute_name + '="' + hawkejs.helpers.encode(options.attributes[attribute_name]) + '" ';
		}
		
		html += '>\n';
		
		if (options.null && elementType == 'select') {
		
			if (options.null == true) {
				html += '<option value=""></option>';
			} else {
				html += '<option value="">' + options.null + '</option>';
			}
			
		}
		
		// Add the options
		for (var i in options.elements) {
			
			option = options.elements[i];
			
			if (options.valueField == false) {
				options._value = i;
			}
			
			html += hawkejs.helpers.selectOption(option, options);
			
		}
		
		html += '</' + elementType + '>\n';
		
		if (options.label) {
			
			var label = title;
			
			if (options.label !== true && options.label !== false) label = options.label;
			
			html = '<label class="control-label" for="' + name + '">' + label + '</label>\n' + html;
		}
		
		// If a wrapper is wanted, add it
		if (options.wrapper) html = '<div class="control-group">\n' + html + '\n</div>\n';
		
		// Return the html if wanted
		if (options.return) return html;
		
		// If not, push it to the buffer
		this.scope.buf.push(html);
	}
	
	/**
	 * Create an input field
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.06
	 * @version  2013.02.06
	 *
	 * @param    {string}    name     The name of the field
	 * @param    {object}    options  The options
	 */
	helpers.fieldInput = function fieldInput (name, options) {
		
		var html = '';
		var pendclass = '';
		var prepend = '';
		var append = '';
		var ghost = '';
		var title = false;
		
		// Do nothing if the options isn't defined
		if (typeof options == 'undefined') return;
		
		// Add control group wrappers by default
		if (typeof options.wrapper == 'undefined') options.wrapper = true;
		
		// Do not return, but print out by default
		if (typeof options.return == 'undefined') options.return = false;
		
		// Enable a null parameter by default
		if (typeof options.ghost == 'undefined') options.ghost = true;
		
		// Don't add a label by default
		if (typeof options.label == 'undefined') options.label = false;
		
		// Enable a title by default
		if (typeof options.title == 'undefined') options.title = true;
		
		// Default type is text
		if (typeof options.type == 'undefined') options.type = 'text';
		
		// Is there a starting value?
		if (typeof options.value == 'undefined') options.value = '';
		
		// See what title to add
		if (options.title) {
			if (options.title !== true) {
				title = options.title;
			} else {
				title = name;
			}
		}
		
		if (options.prepend) {
			prepend = '<span class="add-on prepend">' + options.prepend + '</span>';
			pendclass = 'input-prepend ';
		}
		
		if (options.append) {
			append = '<span class="add-on append">' + options.append + '</span>';
			pendclass += 'input-append';
		}
		
		if (options.append || options.prepend) {
			prepend = '<div class="' + pendclass + '">' + prepend;
			append += '</div>';
		}
		
		if (options.ghost) {
			if (options.ghost === true) {
				ghost = title;
			} else {
				ghost = options.ghost;
			}
		}
		
		html = prepend;
		html += '<input type="' + options.type + '" '
			+ 'name="' + name + '" placeholder="' + ghost + '" '
			+ 'value="' + options.value + '" />';
		html += append;
		
		if (options.label) {
			html = '<label class="control-label" for="' + name + '">' + title + '</label>\n' + html;
		}
		
		// If a wrapper is wanted, add it
		if (options.wrapper) html = '<div class="control-group">\n' + html + '\n</div>\n';
		
		// Return the html if wanted
		if (options.return) return html;
		
		// If not, push it to the buffer
		this.scope.buf.push(html);
	}
	
	/**
	 * Create dropdown field for creating doek elements
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.06
	 * @version  2013.02.06
	 *
	 * @param    {object}    elementTypes    All the available element types
	 */
	helpers.doekETMenu = function (elementTypes) {
		var html = '';
		
		for (var typename in elementTypes) {
			var type = elementTypes[typename];
			
			html += '<li><a href="#" data-target="addElementType" data-elementType="' + typename + '">Add ' + type.title + '</a></li>';
		}
		
		this.scope.buf.push(html);
	}

}