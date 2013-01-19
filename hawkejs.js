var jQuery = require('jquery');
var jsdom = require('jsdom').jsdom;
var ejs = require('ejs');
var fs = require('fs');
var $ = jQuery;
var bigHawk = {};

/**
 * A function to strip useless whitespaces
 */
jQuery.fn.htmlClean = function() {
    this.contents().filter(function() {
        if (this.nodeType != 3) {
            $(this).htmlClean();
            return false;
        }
        else {
            return !/\S/.test(this.nodeValue);
        }
    }).remove();
    return this;
}

/**
 * The Hawkejs class
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.17
 * @version  2013.01.19
 */
var Hawkejs = function Hawkejs () {
	
}

/**
 * A link to Hawkejs' prototype
 */
var hp = Hawkejs.prototype;

/**
 * Require attempt are cached in here
 */
hp._requireCache = {};

/**
 * The base view dir is here
 */
hp._baseDir = false;

/**
 * Render a template based on its path,
 * used for Express integration
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.19
 * @version  2013.01.19
 *
 * @param    {string}    path
 * @param    {object}    options
 * @param    {function}  callback
 */
hp.renderFile = function renderFile (path, options, callback) {
	
	if (!this._baseDir) {
		// Get the base view directory
		this._baseDir = options.settings.views;
	}
	
	// Get the filename
	var filename = path.replace(this._baseDir + '/', '');
	
	// Get the view/element name (filename without extension)
	var elementname = filename.split('/').reverse()[0].replace('.ejs', '');
	
	var result = this.render(elementname, options);
	
	callback(null, result);
}

/**
 * Export the express render function through this simple closure
 * 
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.19
 * @version  2013.01.19
 *
 * @param    {string}    path
 * @param    {object}    options
 * @param    {function}  callback
 */
hp.__express = function (path, options, callback) {
	hp.renderFile(path, options, callback);
};


/**
 * Store templates in here
 * @type  {object}
 */
hp.templates = {};

/**
 * Render a template
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.17
 * @version  2013.01.19
 */
hp.render = function render (template, variables) {

	var checkTemplate = this.getTemplate(template);

	if (!checkTemplate) {
		console.error('Hawkejs template "' + template + '" does not exist');
		return '';
	}
	
	if (variables === undefined) {
		variables = {};
	}
	
	// Create a new, clean payload
	// This will travel along with all the element renders
	var payload = {};
	
	// The buffer will be stored in here
	payload.scope = {};
	payload.request = {};
	payload.request.layout = [];
	
	// Blocks generated inside a template will be stored in here
	payload.request.blocks = {};
	
	// Elements (other templates) will be stored in here
	payload.request.elements = {};
	
	// Also create a link to the variables in the payload,
	// even though we'll also add them one level further down
	payload.scope.variables = variables;
	
	/**
	 * Extend the payload:
	 * - First add all the variables to the root of the object
	 * - Only THEN do we add the helpers
	 * => This way no variable can override a helper
	 *    This also means certain variables can't be set in the root
	 */
	$.extend(payload, variables, this.helpers);
	
	// This variable will be used to check for infinite loops
	var doCounter = 0;
	
	// Intermediate result in the do
	var doResult = {html: '', instructions: []};
	
	// The render stack
	var doStack = [template];
	
	// The template to render
	var doTemplate;
	
	
	// Start rendering templates
	do {
		
		// Get the template to render
		doTemplate = doStack.shift();
		
		// Increase the counter
		doCounter++;
		
		// Get the template
		var templateSource = this.getTemplate(doTemplate);
		
		// Render the template
		doResult = this._render(templateSource, payload);

		for (var i in doResult.instructions) {
			doStack.push(doResult.instructions[i]);
		}
		
		// Store the result in the elements object
		payload.request.elements[doTemplate] = doResult.html;
		
	} while (doStack.length && doCounter < 500);
	
	if (doCounter > 100) console.error('Possible infinite loop detected while rendering template "' + template + '"');
	
	// The elements are strings, but the blocks still need joining
	// Also: create a workable element
	for (var i in payload.request.blocks) {
		
		// Get the block
		var block = payload.request.blocks[i];
		
		// Join the html, using newline as a separator
		var blockHtml = block.buf.join('\n');
		
		// Store the html back into the item
		payload.request.blocks[i] = {html: blockHtml, element: jsdom(blockHtml)};
	}
	
	// Create an element we can modify with jquery
	for (var i in payload.request.elements) {
		
		// Get the element
		var el = payload.request.elements[i];
		
		payload.request.elements[i] = {html: el, element: jsdom(el)}
	}
	
	// Store the element we originally requested
	var requested = payload.request.elements[template];
	
	// Prepare the finished element
	var resultElement = requested.element;

	// Layouts "extend" the wanted element
	for (var i in payload.request.layout) {
		
		var layoutName = payload.request.layout[i];
		var layout = payload.request.elements[layoutName];
		
		resultElement = this._renderLayout(layout, resultElement, payload);
	}
	
	// Strip away extra whitespaces
	$(resultElement).htmlClean();
	
	return resultElement.innerHTML;
}

/**
 * Render a layout
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.18
 * @version  2013.01.18
 *
 * @param    {object}   layoutObject   The layout object
 * @param    {object}   reqElement     The original element
 * @param    {object}   payload        The payload
 */
hp._renderLayout = function _renderLayout (layoutObject, reqElement, payload) {
	
	// Insert blocks into spaces
	this._insertBlock(layoutObject.element, payload);
	
	// Return the element
	return layoutObject.element;
	
}

/**
 * Fill in all spaces inside an element or block.
 * You pass de JSDOM Element, and it looks for things inside the payload
 * 
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.18
 * @version  2013.01.18
 *
 * @param    {object}   origin   The origin element
 */
hp._insertBlock = function _insertBlock (origin, payload) {

	var $spaces = $('[data-hawkejs-space]', origin);
	
	// Store the amount of spaces
	var spaceNr = $spaces.length;
	
	// Go over every spice like this (don't use for...in! It goes over properties)
	for (var i = 0; i < spaceNr; i++) {
		
		// jQueryfy this space
		var $this = $($spaces[i]);
		
		var blockname = $this.attr('data-hawkejs-space');
		
		// If a block exists, fill it in!
		if (payload.request.blocks[blockname]) {
			
			// Create a link to the block
			var b = payload.request.blocks[blockname];
			
			// Clone the block
			var clone = jsdom(b.html);
			
			// insert the blocks here, too
			this._insertBlock(clone, payload);
			
			$this.html(clone.innerHTML);
		}
	}
	
}

/**
 * Render a template with ejs and return the data
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.18
 * @version  2013.01.18
 */
hp._render = function _render (templatesource, payload) {
	
	// A "local" scope object, only to be used during this render
	var prive = {
		prive: {
			blocks: {},
			chain: ['_'],
			instructions: []
		}
	};
	
	// The return var
	var result = {html: '', instructions: []};
	
	// Render using ejs
	result.html = ejs.render(templatesource, $.extend({}, payload, prive));
	
	// Get possible instructions by cloning prive's instructions
	result.instructions = prive.prive.instructions.slice(0);
	
	return result;
}

/**
 * If a template hasn't been loaded already, get it
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.19
 * @version  2013.01.19
 *
 * @param    {string}   name    The template name to get
 * @returns  {string}   The template code
 */
hp.getTemplate = function getTemplate (name) {
	
	// See if we already tried to get this template
	if (this._requireCache[name]) {
		
		// We required it before, see if it was found, too
		if (this.templates[name]) {
			return this.templates[name];
		} else {
			// Not found, return empty string
			console.error('Tried to get template that does not exist: ' + name);
			return '';
		}
		
	} else {
		
		// Only attempt to load it if the basedir is set
		if (this._baseDir) {
			
			// We'll read the file synchronous
			var original = fs.readFileSync(this._baseDir + '/' + name + '.ejs', 'utf-8');
			
			// Store the template and return it
			return this.storeTemplate(name, original);
		
		} else {
			console.error('Tried to get template, but base view dir is not set. Template not loaded: ' + name);
			return '';
		}
	}
	
}

/**
 * Store a template
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.19
 * @version  2013.01.19
 *
 * @param    {string}    name     The template name to store
 * @param    {string}    source   The template code
 * @returns  {string}    The modified template code
 */
hp.storeTemplate = function storeTemplate (name, source) {
	
	// Always prepend this code to the template, in order to expose the buffer
	var buffercode = '<% this.buf = buf %><% render_start(buf) %>';
	var endcode = '<% render_end(buf) %>';
	
	// Store the template content in this variable
	this.templates[name] = buffercode + source + endcode;
	
	// Also indicate this file has been loaded already
	this._requireCache[name] = true;
	
	return this.templates[name];
}

/**
 * Load a template directory
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.17
 * @version  2013.01.17
 */
hp.loadDirectory = function loadDirectory (path, subdir) {
	
	// Store it with this subdir
	if (subdir === undefined) subdir = '';
	
	// A link to this object
	var thisHawk = this;
	
	// Set the base dir
	var fullpath = './';
	
	// If the given path is absolute, remove the basedir
	if (path.charAt(0) == '/') fullpath = '';
	
	// If the given path already starts with a dot, also remove the basedir
	if (path.charAt(0) == '.') fullpath = '';
	
	// Now add the given dir
	fullpath += path;
	
	fs.readdir(fullpath, function (err, files){
		
		if (err) {
			console.error('Hawkejs error while loading directory "' + fullpath + '"');
			console.error(err);
		} else {

			for (var i in files) {
				
				var filename = files[i];
				
				(function(filename) {
					
					// See if it really is a file
					fs.stat(fullpath + '/' + filename, function (err, stat) {
						
						if (err) {
							console.error('Error while loading Hawkejs template, could not stat ' + fullpath + '/' + filename);
							throw err;
						} else if (stat.isDirectory()) {
							
							// Recursively load in this directory
							thisHawk.loadDirectory(fullpath + '/' + filename, subdir + filename + '/');
							
						} else if (stat.isFile()) {
						
							// Get the templatename (without the .ejs extension)
							var template = subdir + filename.split('/').reverse()[0].replace('.ejs', '');
						
							fs.readFile(fullpath + '/' + filename, 'utf8', function read (err, data) {
								if (err) {
									throw err;
								} else {
									
									thisHawk.storeTemplate(template, data);
								}
							});
						}
					});
					
				})(filename);
			}
		}
	});

}

/**
 * Template helpers will be defined in here
 * Helpers are run inside the template
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.17
 * @version  2013.01.17
 */
hp.helpers = {};

// Helpers link
var helpers = hp.helpers;

helpers.render_start = function (buf) {
	this.prive.buflink = buf;
}

helpers.render_end = function(buf) {
	this.prive.buflink = this.scope.buf;
}

/**
 * Assign a block
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.17
 * @version  2013.01.17
 */
helpers.assign = function assign (blockname, removewrapper) {
	
	if (removewrapper === undefined) removewrapper = false;
	
	var div = '<div id="hawkejs-space-' + blockname + '" '
	          + 'data-hawkejs-space="' + blockname + '" '
						+ 'data-remove="' + removewrapper + '">'
						+ '</div>';
	
	this.scope.buf.push(div);
}

/**
 * Start a block
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.18
 * @version  2013.01.18
 */
helpers.start = function start (blockname) {
	
	this.request.blocks[blockname] = {
		start: true,
		end: false,
		buf: []
	};
	
	// Get the block we're currently working on
	var currentblock = this.prive.chain[0];

	// Clone the original buffer
	this.prive.blocks[currentblock] = this.scope.buf.slice(0);
	
	// Reset the buf
	this.scope.buf.length = 0;
	
	// Add this block to the chain
	this.prive.chain.unshift(blockname);
}

/**
 * End a block
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.18
 * @version  2013.01.18
 */
helpers.end = function end () {
	
	// Remove an item from the block chain
	var shift = this.prive.chain.shift();
	
	// Don't remove the starting block
	if (shift == '_') this.prive.chain.unshift('_');
	
	var blockname = shift;
	
	// Return nothing if there was no opening tag
	if (this.request.blocks[blockname] === undefined) {
		return;
	}
	
	this.request.blocks[blockname].end = true;
		
	// Store this buffer in the payload block
	this.request.blocks[blockname].buf = this.scope.buf.slice(0);
	
	var previousblock = this.prive.chain[0];

	this.scope.buf.length = 0;
	
	for (var i in this.prive.blocks[previousblock]) {
		var item = this.prive.blocks[previousblock][i];
		
		this.scope.buf.push(item);
	}
	
}

/**
 * Print out a block right now
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.18
 * @version  2013.01.18
 *
 * @param   {string}   blockname   The name of the block to print out
 */
helpers.print_block = function print_block (blockname) {
	
	if (this.request.blocks[blockname] === undefined) {
		console.log(blockname + ' not found');
		return;
	}
	
	var buf = this.request.blocks[blockname].buf;
	
	// Push every entry from the wanted block buffer to the current buffer
	for (var i in buf) {
		this.scope.buf.push(buf[i]);
	}
	
}

/**
 * Print out an element right now.
 * The element is recursively rendered first.
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.18
 * @version  2013.01.18
 *
 * @param    {string}   elementname   The name of the element to print out
 */
helpers.print_element = function print_element (elementname) {
	
	if (bigHawk.templates[elementname] === undefined) {
		console.log('Element "' + elementname + '" was not found');
		return;
	}

	var html = bigHawk.render(elementname, this.scope.variables);
	
	this.scope.buf.push(html);
}

/**
 * Simply print out what we are given
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.19
 * @version  2013.01.19
 *
 * @param    {string}   variable   The variable to print
 */
helpers.print = function print (variable) {
	this.scope.buf.push(variable);
}

/**
 * Indicate this element is an expansion
 * of another, given element
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.17
 * @version  2013.01.18
 */
helpers.expands = function expands (elementname) {
	
	// Add this elementname to the layout array
	// The current element should "expand" this element
	this.request.layout.push(elementname);
	
	// Add it to the local instructions
	this.prive.instructions.push(elementname);
}
	

// Export the Hawkejs class
module.exports = new Hawkejs();