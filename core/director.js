
/**
 * The director handles scenarios, and makes sure they get executed properly
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.21
 * @version  2013.02.21
 */
module.exports = function Director (elric) {
	
	var thisDirector = this;

	/**
	 * Get all the scenarios that listen to the given activity
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.22
	 * @version  2013.02.22
	 *
	 * @param    {String}    activity_name
	 *
	 * @returns  {Object}    An object containing all matching scenarios
	 */
	var getScenarios = function getScenarios (activity_name) {
		
		// Scenarios matching this activity will be stored in here
		var result_scenarios = {};
		
		// Get all the available scenarios from the cache
		var scenarios = elric.models.scenario.cache;
		
		for (var id in scenarios) {
			var scenario = scenarios[id];
			
			for (var i in scenario.triggers) {
				var trigger = scenario.triggers[i];
				
				// If the activity matches, store the scenario in here
				if (trigger.type == 'activity' && trigger.value == activity_name) {
					result_scenarios[id] = scenario;
				}
				
			}
			
		}
		
		return result_scenarios;
	}
	
	/**
	 * Get a scenarioblock
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.22
	 * @version  2013.02.22
	 *
	 * @param    {String}    block_id    The block id to get
	 * @param    {Object}    scenario    The scenario to get it from
	 */
	var getScenarioBlock = function getScenarioBlock (block_id, scenario) {
		
		var blocks;
		var block;
		
		if (!block_id && !scenario) return false;
		
		// If no block id was given, we want the entrance block
		if (!block_id) {
			blocks = elric.models.scenarioBlock.many.scenario_id.cache[scenario._id];

			// Look for the entrance block
			for (var id in blocks) {
				block = blocks[id];
				if (block.block_type == 'entrance') return block;
			}
		} else {
			
			if (typeof elric.models.scenarioBlock.cache[block_id] != 'undefined') {
				block = elric.models.scenarioBlock.cache[block_id];
				return block;
			}
		}
		
		// If all else fails, return false
		return false;
	}
	
	/**
	 * Run a scenario
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.22
	 * @version  2013.02.22
	 *
	 * @param    {Object}    scenario    The scenario to execute
	 * @param    {Object}    activity    The activity instance trigger
	 */
	var runScenario = function runScenario (scenario, activity) {
		
		// Get the entrance block
		var entrance = getScenarioBlock(false, scenario);
		
		if (entrance) runBlock(entrance, activity);
	}
	
	var runBlock = function runBlock (block, activity) {
		
		var is_true = false;
		var next_blocks;
		
		// If the block we're running is an entrance,
		// just get all the next blocks to run
		if (block.block_type == 'entrance') {
			is_true = true;
		} else if (block.block_type == 'activity') {
			
			var is_true = false;

			if (block.settings.activity && block.settings.activity == activity.parent.name) {
				
				// If we only check for an activity type, without conditions, then this result is true
				is_true = true;
				
				if (block.conditions) {
					for (var index in block.conditions) {
						var c = block.conditions[index];
						
						if (activity.payload[c.property]) {
							// Right now, we only do ==, no matter what operator was selected
							if (activity.payload[c.property] == c.value) {
								is_true = true;
							} else {
								is_true = false;
							}
							
						} else {
							// We didn't even find the property to check, so it's false
							is_true = false;
						}
						
					}
				}
				
			} else {
				is_true = false;
			}
		} else if (block.block_type == 'action') {
			
			var settings = block.settings;
			var action_name = block.settings.action;
			
			var action = elric.actions[action_name];
			var action_payload = {};
			
			for (var name in action.blueprint) {
				action_payload[name] = settings[name];
			}
			
			action.activate(action_payload);
			
			is_true = true;
		}
		
		if (is_true) {
			next_blocks = block.out_on_true;
		} else {
			next_blocks = block.out_on_false;
		}

		for (var index = 0; index < next_blocks.length; index++) {
			
			var next_block = getScenarioBlock(next_blocks[index]);
			
			if (next_block) {
				runBlock(next_block, activity);
			}
		}
	}
	
	/**
	 * Listen for activities, and run scenarios linked to them
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.22
	 * @version  2013.02.22
	 */
	elric.events.activities.on('activity', function (event_info, activity) {
		
		var activity_name = activity.parent.name;
		var scenarios = getScenarios(activity_name);
		
		for (var scenario_id in scenarios) {
			runScenario(scenarios[scenario_id], activity);
		}
	});
	
};