Elric.plumb = {};

// Set SVG as the standard rendering method
jsPlumb.setRenderMode(jsPlumb.SVG);

// Set some defaults
jsPlumb.importDefaults({
	// the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
	// case it returns the 'labelText' member that we set on each connection in the 'init' method below.
	ConnectionOverlays : [
		[ "Arrow", { location:0.8 } ],
		[ "Label", { 
			location:0.2,
			id:"label",
			cssClass:"aLabel"
		}]
	],
	ConnectorZIndex:5
});

// Define connector styles
Elric.plumb.styles = {};

Elric.plumb.styles.connector_true = {
	lineWidth:5,
	strokeStyle:"#74A039",
	joinstyle:"round"
};

Elric.plumb.styles.connector_false = {
	lineWidth:5,
	strokeStyle:"#E22607",
	joinstyle:"round",
	outlineColor:"none",
	outlineWidth:7
};

Elric.plumb.styles.hover = {
	lineWidth:7,
	strokeStyle:"#E2AA00"
};

// Define endpoints
Elric.plumb.endpoints = {};

// The entrance endpoint
// Each object has this, except the starting object
Elric.plumb.endpoints.entrance = {
	anchor: "TopCenter",
	endpoint: "Dot",					
	paintStyle: {fillStyle: "#275D51", radius: 11},
	hoverPaintStyle: Elric.plumb.styles.hover,
	maxConnections: -1,
	dropOptions: {hoverClass: "hover", activeClass: "active"},
	isTarget: true,
	overlays: [
		["Label", {location: [0.5, -0.5], label: "In", cssClass: "targetLabelIn"}]
	]
};

Elric.plumb.endpoints.out_true = {
	anchor: "BottomLeft",
	endpoint: "Dot",
	paintStyle: {fillStyle: "#74A039", radius: 7},
	isSource: true,
	maxConnections: -1,
	connector: ["Flowchart", {stub: [40, 60], gap: 10}],								
	connectorStyle:Elric.plumb.styles.connector_true,
	hoverPaintStyle:Elric.plumb.styles.hover,
	connectorHoverStyle:Elric.plumb.styles.hover,
	dragOptions:{},
	overlays:[
		["Label", { 
			location: [0.5, 1.5], 
			label: "True",
			cssClass: "endpointLabelTrue" 
		}]
	]
};

Elric.plumb.endpoints.out_false = {
	anchor: "BottomRight",
	endpoint: "Dot",
	paintStyle: {fillStyle: "#E22607", radius: 7},
	isSource: true,
	maxConnections: -1,
	connector: ["Flowchart", {stub: [40, 60], gap: 10}],								
	connectorStyle:Elric.plumb.styles.connector_false,
	hoverPaintStyle:Elric.plumb.styles.hover,
	connectorHoverStyle:Elric.plumb.styles.hover,
	dragOptions:{},
	overlays:[
		["Label", { 
			location: [0.5, 1.5], 
			label: "False",
			cssClass: "endpointLabelFalse" 
		}]
	]
};

/**
 * A new connection between 2 endpoints has been made
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.18
 * @version  2013.02.18
 *
 * @param    {Object}    connection
 */
Elric.plumb.init_connection = function init_connection (connInfo) {
	
	// Create by reference objects
	var objects = Elric.plumb.state.objects;
	var connection = connInfo.connection;
	
	// Get the connection type
	var type = connInfo.sourceEndpoint.getOverlay().getLabel().toLowerCase();
	
	// Make a new entry for this connection we can store later on
	if (typeof objects[connInfo.sourceId].to_connections[type] == 'undefined') {
		objects[connInfo.sourceId].to_connections[type] = {};
	}
	
	objects[connInfo.sourceId].to_connections[type][connInfo.targetId] = connInfo.targetId;
	
	// Add a label to the connection
	connection.getOverlay("label").setLabel(connection.sourceId.substring(6) + "-" + connection.targetId.substring(6));
}

/**
 * A connection between 2 endpoints has been removed
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.18
 * @version  2013.02.18
 *
 * @param    {Object}    connection
 */
Elric.plumb.delete_connection = function init_connection (connInfo) {
	
	// Create by reference objects
	var objects = Elric.plumb.state.objects;
	
	// Get the connection type
	var type = connInfo.sourceEndpoint.getOverlay().getLabel().toLowerCase();
	
	// Delete this entry
	delete objects[connInfo.sourceId].to_connections[type][connInfo.targetId];
	
}

/**
 * Alias function to add multiple anchors to an element
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.18
 * @version  2013.02.18
 *
 * @param    {String}    toId
 * @param    {Array}     anchors
 */
Elric.plumb.add_anchor_types = function add_anchor_types (toId, anchor_types) {
	for (var i in anchor_types) Elric.plumb.add_anchor_type(toId, anchor_types[i]);
}

/**
 * Add a single anchor to an element
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.18
 * @version  2013.02.18
 *
 * @param    {String}    toId
 * @param    {String}    anchor
 */
Elric.plumb.add_anchor_type = function add_anchor_type (toId, anchor) {
	
	anchor = anchor.toLowerCase();
	
	var objects = Elric.plumb.state.objects;
	
	var new_endpoint;
	var endpoint_style = {};
	var uuid = toId + '-' + anchor;
	var options = {uuid: uuid};
	
	// Find the correct endpoint style
	switch (anchor) {
		
		case 'in':
		case 'entrance':
			endpoint_style = Elric.plumb.endpoints.entrance;
			break;
		
		case 'true':
		case 'out_true':
			endpoint_style = Elric.plumb.endpoints.out_true;
			break;
		
		case 'false':
		case 'out_false':
			endpoint_style = Elric.plumb.endpoints.out_false;
			break;
	}
	
	// Create the new endpoint
	new_endpoint = jsPlumb.addEndpoint(toId, endpoint_style, options);
	
	// store the new endpoint in here
	Elric.plumb.state.source_endpoints.push(new_endpoint);
}

/**
 * Add a new block to the scenario
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.18
 * @version  2013.02.21
 *
 * @param    {String}    block_type
 */
Elric.plumb.add_new_block = function add_new_block (block_type, options) {
	
	var block;
	var reqdata;
	
	if (typeof options == 'undefined') options = {};
	
	options.block_type = block_type;
	options.class = block_type;
	
	// If there is no id, ask the server to create a block
	if (typeof options.id == 'undefined') {
		
		// Only create a new entrance block if no other exist!
		if (block_type == 'entrance') {
			for (var i in Elric.exposed.scenario_blocks) {
				block = Elric.exposed.scenario_blocks[i];
				if (block.block_type == 'entrance') return;
			}
		}
		
		reqdata = {
			scenario_id: Elric.plumb.state.scenario_id,
			block_type: block_type
		};
		
		$.post('/scenario/block/create', reqdata, function(data) {
			options.id = data._id;
			Elric.plumb.create_block(options);
		}, 'json');
		
		return;
	}
	
	Elric.plumb.create_block(options);
}

/**
 * Create a block html
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.18
 * @version  2013.02.20
 *
 * @param    {Object}    options
 */
Elric.plumb.create_block = function (options) {
	
	if (typeof options == 'undefined') options = {};
	if (typeof options.block_type == 'undefined') options.block_type = 'conditional';
	if (typeof options.id == 'undefined') options.id = 'unnamed-block-' + options.block_type + '-' + (new Date()).getTime();
	if (typeof options.class == 'undefined') options.class = '';
	if (typeof options.top == 'undefined') options.top = 60;
	if (typeof options.left == 'undefined') options.left = 100;
	
	var edit_button = '';
	
	switch (options.block_type) {
		
		case 'action':
		case 'activity':
		case 'conditional':
		case 'scenario':
			edit_button = '<button class="btn btn-mini btn-inverse" data-block-type="' + options.block_type + '" data-block-id="' + options.id + '" data-block-edit="button" type="button">Edit</button>';
			break;
	}
	
	var objects = Elric.plumb.state.objects;
	
	// This object still needs initialization
	if (typeof objects[options.id] == 'undefined') {
		
		// Create an entry for later storage
		objects[options.id] = {
			id: options.id,
			to_connections: {},
			type: options.block_type,
			settings: {}
		};
	}
	
	var html = '<div id="' + options.id + '" class="scenarioblock ' + options.class + '" ';
	html += 'data-block-type="' + options.block_type + '" ';
	html += 'style="top:' + options.top + 'px;left:' + options.left + 'px" >'
	html += '<strong>' + options.block_type + '</strong><br/>' + edit_button + '<br/>';
	html += '</div>';
	
	// Add the block to the scenario
	Elric.plumb.state.element.append(html);
	
	var $element = $('#' + options.id);
	
	$('[data-block-edit="button"]', $element).click(function() {
		var $this = $(this);
		
		goToAjaxView('/scenario/block/edit/' + options.id, function() {
			Elric.plumb.state.modal.modal();
		});
		
	});
	
	// Make it draggable
	jsPlumb.draggable($element);
	
	var anchors = [];
	
	switch (options.block_type) {
		
		case 'entrance':
			anchors = ['true'];
			break;
		
		case 'action':
			anchors = ['in', 'true'];
			break;
		
		case 'activity':
		case 'conditional':
			anchors = ['in', 'true', 'false'];
			break;
		
		case 'scenario':
			anchors = ['in'];
			break;
	}
	
	// Create scenario anchors
	Elric.plumb.add_anchor_types(options.id, anchors);
}

/**
 * Save the current scenario to the database
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.18
 * @version  2013.02.21
 *
 * @param    {Object}    options
 */
Elric.plumb.save = function save () {
	
	var url = '/scenario/save/' + Elric.plumb.state.scenario_id;

	var blocks = Elric.plumb.state.objects;
	
	for (var id in blocks) {
		var block = blocks[id];
		
		var $block = $('#' + id);
		
		block.top = parseInt($block.css('top'));
		block.left = parseInt($block.css('left'));
	}
	
	var scenario_data = {
		name: Elric.plumb.state.scenario_name,
		blocks: blocks
	};
	
	$.post(url, scenario_data, function(data) {
		
	});
}

/**
 * Create a listing field
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.20
 * @version  2013.02.20
 *
 * @param    {Object}    $object           The jQuery object to use
 * @param    {Object}    select_options    The select options
 * @param    {Object}    conditions        The 
 */
Elric.plumb.makeListing = function makeListing ($object, select_options, conditions) {
	
	var data = conditions;
	
	var resave = function resave () {
		conditions = data;
	}

	// Create the listing fields
	var $base = $('<div class="listing"></div>');
	var $ul = $('<ul><li style="visibility:hidden;"></li></ul>');
	
	// Create the new input field
	var $input = $('<div class="new"></div>');
	var $button = $('<button>Add another</button>').click(function (e) {
		e.preventDefault();
		newinput();
	});
	
	var newinput = function newinput () {
		var newvalue = {property: '', operator: '', value: ''};
		var newid = data.push(newvalue)-1;
		addLi(newid, newvalue);
		resave();
	}
	
	// A function for adding listing elements to a ul
	var addLi = (function ($beforeinput) {
		return function (index, value_object) {
			
			// Create a new list element
			var $newli = $('<li></li>');
			
			// Get the current values of this condition
			var property = value_object.property;
			var operator = value_object.operator;
			var value = value_object.value;
			
			// Prepare the property select
			var property_select_construct = {
				valueField: false,
				elements: select_options,
				value: property,
				return: true,
				attributes: {'data-condition-id': index, 'data-condition-type': 'property'}
			};

			// Create a property select object
			var property_html = hawkejs.helpers.fieldSelect('property-' + index, property_select_construct);
			var $property_select = $(property_html);
			
			// Prepare the operator select
			var operator_select_construct = {
				valueField: false,
				titleField: false,
				elements: {'equals': 'equals', 'contains': 'contains', 'gt': 'greater than', 'st': 'smaller than'},
				value: operator,
				return: true,
				attributes: {'data-condition-id': index, 'data-condition-type': 'operator'}
			};
			
			// Create the operator select object
			var operator_html = hawkejs.helpers.fieldSelect('operator-' + index, operator_select_construct);
			var $operator_select = $(operator_html);
			
			// And finally: the value to check against
			var $value_input = $('<input type="text" id="value-' + index + '" data-condition-id="' + index + '" data-condition-type="value" value="' + hawkejs.helpers.encode(value) + '"></input>');
			
			$newli.append($property_select).append($operator_select).append($value_input);
			$beforeinput.before($newli);
			
			$('[data-condition-id="' + index + '"]', $newli).change(function () {
				$this = $(this);
				var element_id = $this.attr('id');
				var condition_id = $this.attr('data-condition-id');
				var type = $this.attr('data-condition-type');
				var value = $this.val();

				data[condition_id][type] = value;
				resave();
			});
			
		}
	})($input);
	
	// Add the button to the input
	$input.append($button);
	
	// Add the new input field to the ul
	$ul.append($input);
	
	var emptyli = true;
	
	// Add the existing data to the ul
	for (var index in data) {
		var value = data[index];
		addLi(index, value);
		emptyli = false;
	}
	
	// Create 1 empty input to get the user started
	if (emptyli) {
		newinput();
	}
	
	// Add the ul to the base
	$base.append($ul);
	
	$object.after($base);
}

/**
 * Ready the modal for editing an action block
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.21
 * @version  2013.02.21
 *
 * @param    {Object}    $element
 */
Elric.plumb.edit_block_action = function ($element) {
	
	var $select = $('[name="actions"]', $element);
	var $flux = $('.flux', $element);
	var block = Elric.exposed.scenario_block;
	
	if (typeof block.settings == 'undefined') block.settings = {};
	if (typeof block.settings.payload == 'undefined') block.settings.payload = {};
	
	$select.change(function (e) {
		
		$this = $(this);
		
		// Get the action name
		var action_name = $this.val();
		
		// Store this in the block settings
		block.settings.action = action_name;
		
		// Get the activity
		var action = Elric.exposed.scenario_actions[action_name];
		
		var html = '';
		
		for (var field_name in action.blueprint) {
			
			var b = action.blueprint[field_name];
			
			var input_constructor = {
				title: b.title,
				return: true,
				value: block.settings[field_name]
			};
			
			html += hawkejs.helpers.fieldInput(field_name, input_constructor);
			
		}
		
		$flux.html(html);
		
	});
	
	// Set the save functionality
	$('#scenario-block-save').click(function(){
		
		// Get all the inputs
		var $inputs = $('input', $flux);
		
		// and now only copy over those that are useful
		for (var i = 0; i < $inputs.length; i++) {
			var $input = $($inputs[i]);
			
			var name = $input.attr('name');
			var value = $input.val();
			
			block.settings[name] = value;
			
		}
		
		$.post('/scenario/block/' + block._id + '/save', {block: block}, function() {
			
		});
	});
	
	// Set the current selections
	if (typeof block.settings.action != 'undefined') {
		$select.val(block.settings.action);
		$select.change();
	}
	
}

/**
 * Ready the modal for editing an activity block
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.20
 * @version  2013.02.20
 *
 * @param    {Object}    $element
 */
Elric.plumb.edit_block_activity = function ($element) {
	
	var $select = $('[name="activities"]', $element);
	var $flux = $('.flux', $element);
	var block = Elric.exposed.scenario_block;
	
	if (typeof block.conditions == 'undefined') block.conditions = [];
	if (typeof block.settings == 'undefined') block.settings = {};
	
	$select.change(function (e) {
		
		$this = $(this);
		
		// Get the activity name
		var activity_name = $this.val();
		
		// Store this in the block settings
		block.settings.activity = activity_name;
		
		// Get the activity
		var activity = Elric.exposed.scenario_activities[activity_name];
		
		$flux.html('');
		
		Elric.plumb.makeListing($flux, activity.blueprint, block.conditions);
		
	});
	
	// Set the save functionality
	$('#scenario-block-save').click(function(){
		
		// Create a clone of the conditions
		var moved_conditions = block.conditions.splice(0);
		
		// Reset the original conditions
		block.conditions = [];
		
		// and now only copy over those that are useful
		for (var i = 0; i < moved_conditions.length; i++) {
			var c = moved_conditions[i];
			
			if (c.property && c.operator) {
				block.conditions.push(c);
			}
		}
		
		$.post('/scenario/block/' + block._id + '/save', {block: block}, function() {
			
		});
	});
	
	// Set the current selections
	if (typeof block.settings.activity != 'undefined') {
		$select.val(block.settings.activity);
		$select.change();
	}
}

// The can be only 1 jsplumb instance active at the same time
Elric.plumb.state = {};
Elric.plumb.state.scenario = false;
Elric.plumb.state.scenario_name = false;
Elric.plumb.state.scenario_id = false;
Elric.plumb.state.source_endpoints = [];
Elric.plumb.state.target_endpoints = [];
Elric.plumb.state.objects = {};
Elric.plumb.state.element = false;
Elric.plumb.state.modal = false;

// Create the scenario
Elric.plumb.makeScenario = function makeScenario (block_name, template_name) {
	
	Elric.plumb.state.source_endpoints = [];
	Elric.plumb.state.target_endpoints = [];
	Elric.plumb.state.objects = {};
	Elric.plumb.state.element = $('#scenarioview');
	
	// Listen for new connections
	jsPlumb.bind("jsPlumbConnection", function(connInfo, originalEvent) {
		Elric.plumb.init_connection(connInfo);
	});
	
	// Listen for deletec connections
	jsPlumb.bind("jsPlumbConnectionDetached", function(connInfo, originalEvent) { 
		Elric.plumb.delete_connection(connInfo);
	});
	
	// If we're editing a scenario ...
	if (Elric.exposed.scenario_scenario) {
		
		var scenario = Elric.exposed.scenario_scenario;
		var blocks = Elric.exposed.scenario_blocks;
		
		Elric.plumb.state.scenario = scenario;
		Elric.plumb.state.scenario_id = scenario._id;
		
		// If this scenario doesn't have blocks yet, add an entrance block
		if ($.isEmptyObject(Elric.exposed.scenario_blocks)) {
			Elric.plumb.add_new_block('entrance', {left: 300});
		} else { // It does have blocks, so show them
		
			for (var i in blocks) {
				var b = blocks[i];
				
				var options = {
					id: b._id,
					top: b.top,
					left: b.left
				};
				
				Elric.plumb.add_new_block(b.block_type, options);
			}
			
			// Now we go over the blocks again to create links
			for (var i in blocks) {
				var b = blocks[i];
				
				for (var target in b.out_on_true) {
					var con = b.out_on_true[target];
					
					var src = b._id + '-true';
					var trg = con + '-in';
					
					jsPlumb.connect({source: jsPlumb.getEndpoint(src), target: jsPlumb.getEndpoint(trg)});
				}
				
				for (var target in b.out_on_false) {
					var con = b.out_on_false[target];
					
					var src = b._id + '-false';
					var trg = con + '-in';
					
					jsPlumb.connect({source: jsPlumb.getEndpoint(src), target: jsPlumb.getEndpoint(trg)});
				}
				
			}
		}
	}
	
	// Add listeners for adding new blocks
	$('[data-target="addScenarioBlock"]').click(function(e) {
		
		e.preventDefault();
		
		var $this = $(this);
		var block_type = $this.attr('data-scenario-block');
		
		Elric.plumb.add_new_block(block_type);
		
	});
	
	// Store the name of the scenario
	$('#scenarioname').change(function(){
		Elric.plumb.state.scenario_name = $(this).val();
	});
	
	// Listen to the save button
	$('#savescenario').click(function(e) {
		Elric.plumb.save();
		e.preventDefault();
	});
}

// When the scenario-main block gets (re)created, initiate the scenario
hawkejs.event.on('create:template[scenarios/edit]-block[scenario-main]', Elric.plumb.makeScenario);

// Ready the edit-block modal
hawkejs.event.on('create:block[scenario-edit-modal-body]', function (block_name, template_name) {
	
	var $element = $('#hawkejs-insert-block-scenario-edit-modal-body');
	
	switch (template_name) {
		
		case 'blocks/edit_activity':
			Elric.plumb.edit_block_activity($element);
			break;
		
		case 'blocks/edit_action':
			Elric.plumb.edit_block_action($element);
			break;
		
		case 'blocks/edit_conditional':
			break;
		
		case 'blocks/edit_scenario':
			break;
	}
	
});

// The modal has been (re) created
hawkejs.event.on('create:block[scenario-edit-object]', function() {
	Elric.plumb.state.modal = $('#scenario-modal');
});