/**
 * The scenario block model:
 * These are the blocks a scenario is made of
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.18
 * @version  2013.02.21
 */
module.exports = function scenarioBlock (elric) {
	
	// Enable caching this model
	this.enableCache = true;

	this.icon = 'th-large';
	
	this.blueprint = {
		// The user who created this scenario block
		user_id: {
			type: this.mongoose.Schema.Types.ObjectId,
			required: true,
			fieldType: 'Select',
			source: {type: 'model', name: 'user'}
		},
		scenario_id: {
			type: this.mongoose.Schema.Types.ObjectId,
			required: true,
			fieldType: 'Select',
			index: true,
			source: {type: 'model', name: 'scenario'}
		},
		// The scenario block type
		block_type: {
			type: String,
			required: true,
			fieldType: 'String'
		},
		// The conditions of this block
		conditions: {
			type: {}
		},
		// The settings of this block
		settings: {
			type: {}
		},
		// The top position of this block in the scenario
		top: {
			type: Number
		},
		// The left position of this block in the scenario
		left: {
			type: Number
		},
		// Which blocks to process next if the result is true
		out_on_true: {
			type: this.mongoose.Schema.Types.ObjectId,
			array: true
		},
		// Which blocks to process next if the result is false
		out_on_false: {
			type: this.mongoose.Schema.Types.ObjectId,
			array: true
		}
	};
	
	this.admin = {
		title: 'Scenario Blocks',
		fields: ['user_id', 'scenario_id', 'block_type', 'settings', 'out_on_true', 'out_on_false']
	};
	
	this.post('generatecache', function() {
		elric.director.instantiateVariables();
	});
	
}