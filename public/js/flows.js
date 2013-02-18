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

Elric.plumb.create_object = function (options) {
	
	var html = '<div class="window" id="window1"><strong>1</strong><br/><br/></div>';
	
}

// The can be only 1 jsplumb instance active at the same time
Elric.plumb.state = {};
Elric.plumb.state.source_endpoints = [];
Elric.plumb.state.target_endpoints = [];

// Create the flow
Elric.plumb.makeFlow = function makeFlow () {
	
	Elric.plumb.state.source_endpoints = [];
	Elric.plumb.state.target_endpoints = [];

	var init = function(connection) {
		connection.getOverlay("label").setLabel(connection.sourceId.substring(6) + "-" + connection.targetId.substring(6));
	};			
	
	_addEndpoints = function(toId, sourceAnchors, targetAnchors) {
		for (var i = 0; i < sourceAnchors.length; i++) {
			var sourceUUID = toId + sourceAnchors[i];
			Elric.plumb.state.source_endpoints.push(jsPlumb.addEndpoint(toId, Elric.plumb.endpoints.out_true, { anchor:sourceAnchors[i], uuid:sourceUUID }));						
		}
		for (var j = 0; j < targetAnchors.length; j++) {
			var targetUUID = toId + targetAnchors[j];
			Elric.plumb.state.target_endpoints.push(jsPlumb.addEndpoint(toId, Elric.plumb.endpoints.entrance, { anchor:targetAnchors[j], uuid:targetUUID }));						
		}
	};

	_addEndpoints("window4", ["BottomLeft", "BottomRight"], ["TopCenter"]);
	_addEndpoints("window2", ["BottomLeft", "BottomRight"], ["TopCenter"]);
	_addEndpoints("window3", ["BottomLeft", "BottomRight"], ["TopCenter"]);
	_addEndpoints("window1", ["BottomLeft", "BottomRight"], ["TopCenter"]);
				
	// listen for new connections; initialise them the same way we initialise the connections at startup.
	jsPlumb.bind("jsPlumbConnection", function(connInfo, originalEvent) { 
		init(connInfo.connection);
	});			
				
	// make all the window divs draggable						
	//jsPlumb.draggable(jsPlumb.getSelector(".window"), { grid: [20, 20] });
	// THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector method!
	jsPlumb.draggable(jsPlumb.getSelector(".window"));

	//* connect a few up
	jsPlumb.connect({uuids:["window2BottomCenter", "window3TopCenter"]});
	jsPlumb.connect({uuids:["window2LeftMiddle", "window4LeftMiddle"]});
	jsPlumb.connect({uuids:["window4TopCenter", "window4RightMiddle"]});
	jsPlumb.connect({uuids:["window3RightMiddle", "window2RightMiddle"]});
	jsPlumb.connect({uuids:["window4BottomCenter", "window1TopCenter"]});
	jsPlumb.connect({uuids:["window3BottomCenter", "window1BottomCenter"]});
	
	
}

hawkejs.event.on('create-block-flow-add-hack', Elric.plumb.makeFlow);