
/**
 * The director handles scenarios, and makes sure they get executed properly
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.21
 * @version  2013.02.21
 */
module.exports = function Director (elric) {
	
	var thisDirector = this;
	
	// Global scenario variables are stored in here
	this.global_variables = false;
	
	/**
	 * Get blocks from a scenario
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.25
	 * @version  2013.02.25
	 *
	 * @param    {Object|String}    scenario
	 *
	 * @returns  {Object}            The wanted blocks
	 */
	this.getBlocks = function getBlocks (scenario, blocktype, first) {
		
		var scenario_id;
		
		if (typeof scenario != 'string') {
			scenario_id = scenario._id;
		} else {
			scenario_id = scenario;
		}
		
		if (typeof blocktype == 'string') blocktype = [blocktype];
		
		var blocks;
		var block;
		
		// Get all the blocks from this scenario
		blocks = elric.models.scenarioBlock.many.scenario_id.cache[scenario_id];
		
		if (!blocktype) return blocks;
		
		var return_blocks = {};
		
		for (var index in blocktype) {
			
			var type = blocktype[index];
			
			for (var id in blocks) {

				if (blocks[id].block_type == type) {
					
					// If we only want the first block, return just that
					if (first) return blocks[id];
					
					return_blocks[id] = blocks[id];
					
				}
				
			}
		}

		return return_blocks;
	}
	
	/**
	 * Get all variable declarations from a certain scenario
	 * 
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.25
	 * @version  2013.02.25
	 *
	 * @param    {Object|String}    scenario
	 *
	 * @returns  {Object}    All the variables
	 */
	this.getVariables = function getVariables (scenario) {
		
		// Get the activity and valuesetter blocks
		var activity_blocks = this.getBlocks(scenario, 'activity');
		var set_blocks = this.getBlocks(scenario, 'valuesetter');

		var variables = {local: {}, global: {}, activity: {}};

		// Add all activity blueprint variables to the result object
		for (var id in activity_blocks) {
			block = activity_blocks[id];
			
			// Get the block's activity
			var activity_name = block.settings.activity;
			
			// If the activity isn't set, continue to the next block
			if (!activity_name) continue;
			
			// Create an entrance in the variables object for this activity
			variables.activity[activity_name] = {};
			
			// Get the activity
			var activity = elric.activities[activity_name];
			
			for (var var_name in activity.blueprint) {
				variables.activity[activity_name][var_name] = {name: var_name, title: activity.blueprint[var_name].title};
			}
		}
		
		// Now parse all the set variables
		for (var id in set_blocks) {
			block = set_blocks[id];
			
			var scope = block.settings.scope ? block.settings.scope : 'global';
			var ttl = block.settings.ttl ? block.settings.ttl : -1;
			var var_name = block.settings.var_name;
			var var_value = block.settings.var_value;

			variables[scope][var_name] = {name: var_name, title: var_name, value: var_value, ttl: ttl};
		}
		
		return variables;
	}
	
	/**
	 * Instantiate global variables
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.25
	 * @version  2013.02.25
	 */
	this.instantiateVariables = function instantiateVariables () {
		
		var scenarios = this.getScenarios();
		
		// Make sure the global variables container is an object
		if (!this.global_variables) this.global_variables = {};
		
		for (var id in scenarios) {
			var scenario = scenarios[id];
			
			var scenario_variables = this.getVariables(scenario);
			
			for (var var_name in scenario_variables.global) {
				var v = scenario_variables.global[var_name];
				
				if (typeof this.global_variables[var_name] == 'undefined') {
					
					// Title values and such can, of course, be overwritten by defining the same variable in different blocks
					this.global_variables[var_name] = {name: var_name, title: v.title, value_blueprint: v.value, ttl: v.ttl};
				}
				
			}
		}
	}

	/**
	 * Get all the scenarios that listen to the given activity,
	 * or all scenarios if no activity is specified
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.22
	 * @version  2013.02.25
	 *
	 * @param    {String}    activity_name
	 *
	 * @returns  {Object}    An object containing all matching scenarios
	 */
	this.getScenarios = function getScenarios (activity_name) {
		
		// Scenarios matching this activity will be stored in here
		var result_scenarios = {};
		
		// Get all the available scenarios from the cache
		var scenarios = elric.models.scenario.cache;
		
		if (!activity_name) return scenarios;
		
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
	 * @version  2013.02.26
	 *
	 * @param    {Object}    scenario    The scenario to execute
	 * @param    {Object}    activity    The activity instance trigger
	 */
	var runScenario = function runScenario (scenario, activity) {
		
		// Get the entrance block
		var entrance = getScenarioBlock(false, scenario);
		
		// Prepare the (local) payload
		var payload = {activity: {}, local: {}, global: this.global_variables, current_activity: activity};
		
		payload.activity[activity.parent.name] = activity;
		
		if (entrance) runBlock(entrance, payload);
	}
	
	/**
	 * Run a block, and every block connected to it
	 *
	 * @author   Jelle De Loecker   <jelle@kipdola.be>
	 * @since    2013.02.22
	 * @version  2013.02.25
	 *
	 * @param    {Object}    block       The block to start from
	 * @param    {Object}    payload     The payload
	 */
	var runBlock = function runBlock (block, payload) {
		
		var is_true = false;
		var next_blocks;
		var activity = payload.current_activity;
		
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
		} else if (block.block_type == 'valuesetter') {
			
			var var_name = block.settings.var_name;
			var var_ttl = block.settings.var_ttl;
			var scope = block.settings.scope;
			
			// @todo: parse this value for expressions (additions and such)
			var var_value = block.settings.var_value;
			var old_value = payload[scope][var_name];
			
			payload[scope][var_name] = var_value;
			
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
	 * @version  2013.03.01
	 */
	elric.events.activities.on('activity', function (event_info, activity) {
		
		var activity_name = activity.parent.name;
		var scenarios = thisDirector.getScenarios(activity_name);
		
		for (var scenario_id in scenarios) {
			runScenario(scenarios[scenario_id], activity);
		}
	});
	
};