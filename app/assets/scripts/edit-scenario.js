hawkejs.scene.on({type: 'set', template: 'scenario/chimera_edit', name: 'chimera-cage'}, function onEditScenario(el, vars) {

	console.log('Edit scenario with vars:', vars);

	hawkejs.require('jsplumb/2.0/jsplumb', function gotJsplumb() {

		var scenario_element = hawkejs.constructor.createElement('elric-scenario');

		window.scenario = scenario_element;

		// Remove all the current elements
		el.innerHTML = '';

		// Append the new element
		el.appendChild(scenario_element);

		// Set block info
		scenario_element.setBlockInfo(vars.all_blocks);

		// Attach the scenario
		scenario_element.setRecord(vars.scenario[0]);
	});
});

var inited_jsplumb = false;

function initJsPlumb(callback) {

	if (!callback) {
		callback = Function.dummy;
	}

	if (inited_jsplumb) {
		return callback();
	}

	inited_jsplumb = true;

	// Require jsplumb
	hawkejs.require('jsplumb/2.0/jsplumb', function gotJsplumb() {

		console.log('Got jsplumb');

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

		// Listen for new connections
		jsPlumb.bind('jsPlumbConnection', function onConnection(connInfo, originalEvent) {
			console.log('Got connection:', connInfo);
			//Elric.plumb.init_connection(connInfo);
		});

		// Listen for deletec connections
		jsPlumb.bind('jsPlumbConnectionDetached', function onDetached(connInfo, originalEvent) { 
			console.log('Detached connection:', connInfo);
			Elric.plumb.delete_connection(connInfo);
		});


		// Wait for the ready signal
		jsPlumb.ready(function onReady() {
			callback();
		});
	});
}