var cheerio = require('cheerio');
var jQuery = require('jquery');
var ejs = require('ejs');
var fs = require('fs');

/**
 * The timer class
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.19
 * @version  2013.01.19
 */
var Timer = function Timer () {
	
	this.begin = new Date().getTime();
	this.end = 0;
	this.result = 0;
}

Timer.prototype.get = function () {
	this.end = new Date().getTime();
	this.result = this.end - this.begin;
	
	return this.result;
}

/**
 * Get a cheerio object,
 * create it if needed
 * 
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.19
 * @version  2013.01.19
 */
var getCheerio = function getCheerio (object) {
	
	if (!object.$) object.$ = cheerio.load(object.html);

	return object.$;
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
 * @version  2013.01.20
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
	var elementname = filename.replace('.ejs', '');
	
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
 * @version  2013.01.20
 */
hp.render = function render (template, variables) {
	
	var t = new Timer();

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
	
	// Expansions of the current element, happen in order
	// (Working element will be inserted into this expansion)
	payload.request.expand = [];
	
	// Elements to be implemented
	// (Implementations will be inserted into the working element)
	payload.request.implement = [];
	
	// Blocks generated inside a template will be stored in here
	payload.request.blocks = {};
	
	// Elements (other templates, like expansions & implementations)
	payload.request.elements = {};
	
	// Tags to be injected are stored here
	payload.request.tags = {};
	
	// Also create a link to the variables in the payload,
	// even though we'll also add them one level further down
	payload.scope.variables = variables;
	
	// Add an object in the scope to store temporary stuff
	payload.scope.temp = {};
	
	/**
	 * Extend the payload:
	 * - First add all the variables to the root of the object
	 * - Only THEN do we add the helpers
	 * => This way no variable can override a helper
	 *    This also means certain variables can't be set in the root
	 */
	jQuery.extend(payload, variables, this.helpers);
	
	// This variable will be used to check for infinite loops
	var doCounter = 0;
	
	// Intermediate result in the do
	var doResult = {html: '', instructions: []};
	
	// The render stack
	var doStack = [template];
	
	// The template name to render
	var doTemplate;
	
	// Make sure we don't repeat ourselves:
	// Element that have already been rendered get an entry here
	var doNotRepeat = {};
	
	// Start rendering templates
	do {
		
		// Get the template to render
		doTemplate = doStack.shift();
		
		// Increase the counter
		doCounter++;
		
		// Get the template
		var templateSource = this.getTemplate(doTemplate);
		
		// Render the template
		doResult = this._EjsRender(templateSource, payload);

		for (var i in doResult.instructions) {
			
			var iEName = doResult.instructions[i];
			
			// If this element hasn't been rendered already,
			// add it to the todo list
			if (doNotRepeat[iEName] === undefined) {
				doStack.push(doResult.instructions[i]);
			}
		}
		
		// Store the result in the elements object
		payload.request.elements[doTemplate] = doResult.html;
		
		// Indicate this element has been rendered
		doNotRepeat[doTemplate] = true;
		
	} while (doStack.length && doCounter < 500);
	
	if (doCounter > 100) console.error('Possible infinite loop detected while rendering template "' + template + '"');
	
	console.log('Rendering ' + template + ' took ' + t.get() + 'ms for all EJS to finish');
	
	// The elements are strings, but the blocks still need joining
	// Also: create a workable element
	for (var i in payload.request.blocks) {
		
		// Get the block
		var block = payload.request.blocks[i];
		
		// Join the html, using newline as a separator
		var blockHtml = block.buf.join('\n');
		
		// Store the html back into the item
		payload.request.blocks[i] = {html: blockHtml, $: false, name: i};
	}
	
	// Prepare the element objects
	for (var i in payload.request.elements) {
		
		// Get the element
		var el = payload.request.elements[i];
		
		payload.request.elements[i] = {html: el, $: false, name: i}
	}
	
	// Store the element we originally requested
	var requested = payload.request.elements[template];
	
	// Prepare the finished element
	var $result = getCheerio(requested);

	// Expand the elements with other elements if wanted
	if (payload.request.expand.length) {
		
		for (var i in payload.request.expand) {
			
			var elementName = payload.request.expand[i];
			var expansionElement = payload.request.elements[elementName];
			
			$result = this._postEjsRender(expansionElement, payload);
		}
		
	} else {

		// No expansions were requested, so just finalize the original element
		$result = this._postEjsRender(requested, payload);
		
	}
	
	// Inject tags (scripts, styles)
	for (var i in payload.request.tags) {
		
		var tag = payload.request.tags[i];
		
		if (tag.type == 'script') {
			this._addScript(tag, $result);
		} else if (tag.type == 'style') {
			this._addStyle(tag, $result);
		}
		
	}
	
	console.log('Rendering ' + template + ' took ' + t.get() + 'ms');
	
	return $result.html();
}

/**
 * After the EJS render has finished,
 * we need to implement some of our Hawkejs magic
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.18
 * @version  2013.01.20
 *
 * @param    {object}   layoutObject   The layout object
 * @param    {object}   payload        The payload
 */
hp._postEjsRender = function _postEjsRender (layoutObject, payload) {

	// Insert implementations
	this._insertImplementation(getCheerio(layoutObject), payload);
	
	// Insert blocks into spaces
	this._insertBlock(getCheerio(layoutObject), payload);
	
	// Return the element
	return layoutObject.$;
	
}

/**
 * Fill in all implementation spaces
 * You pass the Cheerio document, and it looks for things inside the payload
 * 
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.20
 * @version  2013.01.20
 *
 * @param    {Cheerio}   $         The origin element
 * @param    {Object}    payload   The payload
 */
hp._insertImplementation = function _insertImplementation ($, payload) {

	var $spaces = $('[data-hawkejs-implement]');
	
	// Store the amount of spaces
	var spaceNr = $spaces.length;
	
	// Go over every space like this (don't use for...in! It goes over properties)
	for (var i = 0; i < spaceNr; i++) {
		
		// Cheeriofy this space
		var $this = $($spaces[i]);
		
		var elementname = $this.attr('data-hawkejs-implement');

		// If the element exists, fill it in!
		if (payload.request.elements[elementname]) {
			
			// Create a link to the block
			var b = payload.request.elements[elementname];
			
			// Create a clone of the block we want to insert
			// Because we might need the original block for another space
			var $clone = cheerio.load(b.html);
			
			// insert the implementations here, too
			this._insertImplementation($clone, payload);
			
			$this.html($clone.html());
		}
	}
}

/**
 * Fill in all spaces inside an element or block.
 * You pass the Cheerio document, and it looks for things inside the payload
 * 
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.18
 * @version  2013.01.19
 *
 * @param    {Cheerio}   $         The origin element
 * @param    {Object}    payload   The payload
 */
hp._insertBlock = function _insertBlock ($, payload) {

	var $spaces = $('[data-hawkejs-space]');
	
	// Store the amount of spaces
	var spaceNr = $spaces.length;
	
	// Go over every space like this (don't use for...in! It goes over properties)
	for (var i = 0; i < spaceNr; i++) {
		
		// Cheeriofy this space
		var $this = $($spaces[i]);
		
		var blockname = $this.attr('data-hawkejs-space');

		// If a block exists, fill it in!
		if (payload.request.blocks[blockname]) {
			
			// Create a link to the block
			var b = payload.request.blocks[blockname];
			
			// Create a clone of the block we want to insert
			// Because we might need the original block for another space
			var $clone = cheerio.load(b.html);
			
			// insert the blocks here, too
			this._insertBlock($clone, payload);
			
			$this.html($clone.html());
		}
	}
}

/**
 * Add a script to the element
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.19
 * @version  2013.01.19
 *
 * @param    {object}   script   The script object
 * @param    {Cheerio}  element  The element to insert it into
 *
 * @returns  {Cheerio}           The modified Cheerio object
 */
hp._addScript = function _addScript (script, $) {

	var html = '<script type="text/javascript" src="' + script.path + '"></script>';
	
	var newElement = this._addHtml($, script.destination, html);
	
	return newElement;
}

/**
 * Add a stylesheet to the element
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.19
 * @version  2013.01.19
 *
 * @param    {object}   style    The style object
 * @param    {Cheerio}  element  The element to insert it into
 *
 * @returns  {Cheerio}           The modified Cheerio object
 */
hp._addStyle = function _addStyle (style, $) {

	var attributes = ' ';
	
	for (var name in style.attributes) {
		
		var value = style.attributes[name];
		
		attributes += name + '="' + value + '" ';
		
	}

	var html = '<link type="text/css" rel="stylesheet" href="' + style.path + '"' + attributes + '/>';
	
	var newElement = this._addHtml($, style.destination, html);
	
	return newElement;
}

/**
 * Inject some html to the element
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.19
 * @version  2013.01.20
 *
 * @param    {object}   $            The element to insert it into
 * @param    {string}   destination  Where it should go
 * @param    {string}   html         The html to inject
 *
 * @returns  {Cheerio}               The modified Cheerio object
 */
hp._addHtml = function _addHtml ($, destination, html) {
	
	// See where this script has to be added
	if (destination == 'anywhere') {
		destination = 'head';
	} else if (destination == 'bottom') {
		destination = 'body'
	}
	
	// Try to get the head element
	var $dest = $(destination);
	
	// If nothing was found, take the element itself as destination
	if (!$dest) $dest = $;

	$dest.append(html);
	
	return $;
}

/**
 * Render a template with ejs and return the data
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.18
 * @version  2013.01.18
 *
 * @param    {string}   templatesource   The template code
 * @param    {object}   payload          The payload, options, variables, ...
 */
hp._EjsRender = function _EjsRender (templatesource, payload) {
	
	// A "local" scope object, only to be used during this render
	var prive = {
		prive: {
			blocks: {},
			chain: ['_'],
			instructions: [],
			assign: {},
			hawkejs: this
		}
	};
	
	// The return var
	var result = {html: '', instructions: []};
	
	var t = new Timer();
	
	// Render using ejs
	result.html = ejs.render(templatesource, jQuery.extend({}, payload, prive));
	
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

/**
 * The render has ended, finalise some things
 */
helpers.render_end = function(buf) {

	var ta = this.prive.assign;
	
	// Make sure all assigns are closed
	for (var blockname in ta) {
		
		var tab = ta[blockname];
		
		// If this assign wasn't finished
		if (!tab.finished) {
			// Add a closing div now
			this.scope.buf[tab.beginline] += '</div>';
		}
	}

	// Write the buffer back
	this.prive.buflink = this.scope.buf;
}

/**
 * Create a place where we can store a block in later on
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.17
 * @version  2013.01.20
 */
helpers.assign = function assign (blockname, removewrapper) {
	
	// Create an alias
	var ta = this.prive.assign;
	
	// Create an entry for this block
	if (ta[blockname] === undefined) {
		ta[blockname] = {
			name: false,
			beginline: false,
			finished: false
		};
	}
	
	var tab = ta[blockname];
	
	// If we're already working on the assign, do nothing
	if (tab.name) {
		
	} else {
		
		tab.name = blockname;
		
		if (removewrapper === undefined) removewrapper = false;
	
		var div = '<div id="hawkejs-space-' + blockname + '" '
							+ 'data-hawkejs-space="' + blockname + '" '
							+ 'data-remove="' + removewrapper + '" '
						+ 'data-hawkejs="true">';
		
		var newLength = this.scope.buf.push(div);
		
		tab.beginline = newLength - 1;
	}
	
}

/**
 * Optional assign_end function.
 * When not used, the assign will be put on 1 single line
 * If used, the part between assign() & assign_end() will
 * be the "standard" text, in case nothing else is filled in
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.19
 * @version  2013.01.20
 */
helpers.assign_end = function assign_end (blockname) {
	
	// Create an alias
	var ta = this.prive.assign;
	
	if (ta[blockname] && !ta[blockname].finished) {
		this.scope.buf.push('</div>');
		ta[blockname].finished = true;
	}
	
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
 * @version  2013.01.20
 *
 * @param    {string}   elementname   The name of the element to print out
 */
helpers.print_element = function print_element (elementname) {

	var html = this.prive.hawkejs.render(elementname, this.scope.variables);
	
	this.scope.buf.push(html);
}

/**
 * Indicate this request needs a script, and add it to it if needed
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.19
 * @version  2013.01.19
 *
 * @param    {string}   scriptpath   The path of the script to add
 * @param    {string}   destination  Where this script should be added
 *                                   Defaults to anywhere
 */
helpers.script = function script (scriptpath, destination) {
	
	// Create an alias to the scripts object
	var s = this.request.tags;
	
	if (destination === undefined) destination = 'anywhere';
	
	if (s[scriptpath] === undefined) {
		s[scriptpath] = {
			type: 'script',
			path: scriptpath,
			destination: destination
		}
	}
}

/**
 * Indicate this request needs a stylesheet, and add it to it if needed
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.19
 * @version  2013.01.19
 *
 * @param    {string}   scriptpath   The path of the script to add
 * @param    {string}   destination  Where this script should be added
 *                                   Defaults to anywhere
 */
helpers.style = function style (stylepath, attributes, destination) {
	
	// Create an alias to the scripts object
	var s = this.request.tags;
	
	if (destination === undefined) destination = 'anywhere';
	
	if (s[stylepath] === undefined) {
		s[stylepath] = {
			type: 'style',
			path: stylepath,
			attributes: attributes,
			destination: destination
		}
	}
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
 * @version  2013.01.20
 */
helpers.expands = function expands (elementname) {
	
	// Add this elementname to the expansion array
	// The current element should "expand" this element
	this.request.expand.push(elementname);
	
	// Add it to the local instructions
	// These will be returned when ejs has finished rendering this element
	// And will in turn be rendered, too
	this.prive.instructions.push(elementname);
}

/**
 * Implement another element inside this one
 * Contrary to print_element(), this will hapen later
 * 
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.01.20
 * @version  2013.01.20
 *
 * @param    {string}   elementname   The element to print
 */
helpers.implement = function implement (elementname) {
	
	var removewrapper = false;
	
	this.request.implement.push(elementname);
	
	// Add it to the local instructions.
	// These will be returned when ejs has finished rendering this element
	// And will in turn be rendered, too
	this.prive.instructions.push(elementname);
	
	// Add an object we can put this element in later
	var div = '<div id="hawkejs-implement-' + elementname + '" '
						+ 'data-hawkejs-implement="' + elementname + '" '
						+ 'data-remove="' + removewrapper + '" '
						+ 'data-hawkejs="true"></div>';
		
	this.scope.buf.push(div);
}

// Export the Hawkejs class
module.exports = new Hawkejs();