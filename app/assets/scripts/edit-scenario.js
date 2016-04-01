hawkejs.scene.on({type: 'set', template: 'scenario/chimera_edit', name: 'chimera-cage'}, function onEditScenario(el, vars) {

	// Make sure jsplumb is loaded
	hawkejs.require('jsplumb/2.0/jsplumb', function gotJsplumb() {

		var scenario_element;

		// Create a new elric-scenario element
		scenario_element = hawkejs.constructor.createElement('elric-scenario');

		// Make it public, for debugging
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