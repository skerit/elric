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
	objects[connInfo.sourceId].to_connections[type] = connInfo.targetId;
	
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
	delete objects[connInfo.sourceId].to_connections[type];
	
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
	
	// This object still needs initialization
	if (typeof objects[toId] == 'undefined') {
		
		// Create an entry for later storage
		objects[toId] = {id: toId, to_connections: {}};
		
		// Make it draggable
		jsPlumb.draggable($('#' + toId));
	}
	
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

Elric.plumb.save = function save () {
	
}

Elric.plumb.create_object = function (options) {
	
	var html = '<div class="window" id="window1"><strong>1</strong><br/><br/></div>';
	
}

// The can be only 1 jsplumb instance active at the same time
Elric.plumb.state = {};
Elric.plumb.state.source_endpoints = [];
Elric.plumb.state.target_endpoints = [];
Elric.plumb.state.objects = {};

// Create the flow
Elric.plumb.makeFlow = function makeFlow () {
	
	Elric.plumb.state.source_endpoints = [];
	Elric.plumb.state.target_endpoints = [];
	Elric.plumb.state.objects = {};

	Elric.plumb.add_anchor_types("window1", ['in', 'true', 'false']);
	Elric.plumb.add_anchor_types("window2", ['in', 'true', 'false']);
	Elric.plumb.add_anchor_types("window3", ['in', 'true', 'false']);
	Elric.plumb.add_anchor_types("window4", ['in', 'true', 'false']);
	
	// Listen for new connections
	jsPlumb.bind("jsPlumbConnection", function(connInfo, originalEvent) {
		Elric.plumb.init_connection(connInfo);
	});
	
	// Listen for deletec connections
	jsPlumb.bind("jsPlumbConnectionDetached", function(connInfo, originalEvent) { 
		Elric.plumb.delete_connection(connInfo);
	});
	
	//* connect a few up
	jsPlumb.connect({uuids:["window2-true", "window1-in"]});
	
}

hawkejs.event.on('create-block-flow-add-hack', Elric.plumb.makeFlow);