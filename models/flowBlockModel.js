/**
 * The flow block model:
 * These are the blocks a flow is made of
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    2013.02.18
 * @version  2013.02.18
 */
module.exports = function flowBlock (elric) {
	
	// Enable caching this model
	this.enableCache = true;

	this.icon = 'th-large';
	
	this.blueprint = {
		// The user who created this flow block
		user_id: {
			type: this.mongoose.Schema.Types.ObjectId,
			required: true,
			fieldType: 'Select',
			source: {type: 'model', name: 'user'}
		},
		flow_id: {
			type: this.mongoose.Schema.Types.ObjectId,
			required: true,
			fieldType: 'Select',
			source: {type: 'model', name: 'flow'}
		},
		// The flow block type
		block_type: {
			type: String,
			required: true,
			fieldType: 'String'
		},
		// The settings of this block
		settings: {
			type: {},
			array: true
		},
		// The top position of this block in the flow
		top: {
			type: Number
		},
		// The left position of this block in the flow
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
		title: 'Flow Blocks',
		fields: ['user_id', 'flow_id', 'block_type', 'settings', 'out_on_true', 'out_on_false']
	};
	
}