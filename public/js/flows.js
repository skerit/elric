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
 * Add a new block to the flow
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.18
 * @version  2013.02.18
 *
 * @param    {String}    block_type
 */
Elric.plumb.add_new_block = function add_new_block (block_type, options) {
	
	if (typeof options == 'undefined') options = {};
	if (typeof options.id == 'undefined') options.id = 'new-block-' + block_type + '-' + (new Date()).getTime();
	options.block_type = block_type;
	options.class = block_type;
	
	Elric.plumb.create_block(options);
}

/**
 * Create a block html
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.18
 * @version  2013.02.18
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
	
	var html = '<div id="' + options.id + '" class="flowblock ' + options.class + '" ';
	html += 'data-block-type="' + options.block_type + '" ';
	html += 'style="top:' + options.top + 'px;left:' + options.left + 'px" >'
	html += '<strong>' + options.block_type + '</strong><br/>' + edit_button + '<br/>';
	html += '</div>';
	
	// Add the block to the flow
	Elric.plumb.state.element.append(html);
	
	var $element = $('#' + options.id);
	
	$('[data-block-edit="button"]', $element).click(function() {
		var $this = $(this);
		
		goToAjaxView('/flow/block/edit/' + options.id, function() {
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
		
		case 'conditional':
			anchors = ['in', 'true', 'false'];
			break;
		
		case 'scenario':
			anchors = ['in'];
			break;
	}
	
	// Create flow anchors
	Elric.plumb.add_anchor_types(options.id, anchors);
	
}

/**
 * Save the current flow to the database
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.18
 * @version  2013.02.18
 *
 * @param    {Object}    options
 */
Elric.plumb.save = function save () {
	
	var url = '';
	
	if (Elric.plumb.state.flow_id) {
		url = '/flow/save/' + Elric.plumb.state.flow_id;
	} else {
		url = '/flow/add';
	}
	
	var blocks = Elric.plumb.state.objects;
	
	for (var id in blocks) {
		var block = blocks[id];
		
		var $block = $('#' + id);
		
		block.top = parseInt($block.css('top'));
		block.left = parseInt($block.css('left'));
		
	}
	
	var flow_data = {
		name: Elric.plumb.state.flow_name,
		blocks: blocks
	};
	
	$.post(url, flow_data, function(data) {
		
	});
	
}

// The can be only 1 jsplumb instance active at the same time
Elric.plumb.state = {};
Elric.plumb.state.flow = false;
Elric.plumb.state.flow_name = false;
Elric.plumb.state.flow_id = false;
Elric.plumb.state.source_endpoints = [];
Elric.plumb.state.target_endpoints = [];
Elric.plumb.state.objects = {};
Elric.plumb.state.element = false;
Elric.plumb.state.modal = false;

// Create the flow
Elric.plumb.makeFlow = function makeFlow () {
	
	Elric.plumb.state.source_endpoints = [];
	Elric.plumb.state.target_endpoints = [];
	Elric.plumb.state.objects = {};
	Elric.plumb.state.modal = $('#flow-modal');
	Elric.plumb.state.element = $('#flowview');
	
	// Listen for new connections
	jsPlumb.bind("jsPlumbConnection", function(connInfo, originalEvent) {
		Elric.plumb.init_connection(connInfo);
	});
	
	// Listen for deletec connections
	jsPlumb.bind("jsPlumbConnectionDetached", function(connInfo, originalEvent) { 
		Elric.plumb.delete_connection(connInfo);
	});
	
	// If we're editing a flow ...
	if (Elric.exposed.flow_flow) {
		
		var flow = Elric.exposed.flow_flow;
		var blocks = Elric.exposed.flow_blocks;
		
		Elric.plumb.state.flow = flow;
		Elric.plumb.state.flow_id = flow._id;
		
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
		
	} else { // This is a new flow
		Elric.plumb.state.flow = false;
		Elric.plumb.state.flow_id = false;
		
		// A new flow always starts with an entrance
		Elric.plumb.add_new_block('entrance', {left: 300});
	}
	
	// Add listeners for adding new blocks
	$('[data-target="addFlowBlock"]').click(function(e) {
		
		e.preventDefault();
		
		var $this = $(this);
		var block_type = $this.attr('data-flow-block');
		
		Elric.plumb.add_new_block(block_type);
		
	});
	
	// Store the name of the flow
	$('#flowname').change(function(){
		Elric.plumb.state.flow_name = $(this).val();
	});
	
	// Listen to the save button
	$('#saveflow').click(function(e) {
		Elric.plumb.save();
		e.preventDefault();
	});
	
	
}

hawkejs.event.on('create-block-flow-add-hack', Elric.plumb.makeFlow);