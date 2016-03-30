module.exports = function elricScenarioElement(Hawkejs, Blast) {

	/**
	 * The ElricScenario element
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	var ElricScenario = Function.inherits('Hawkejs.Element', function ElricScenario() {
		return ElricScenario.super.call(this);
	});

	/**
	 * Set the scenario record
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	ElricScenario.setProperty('default_block_options', {
		type   : 'conditional',
		class  : '',
		top    : 60,
		left   : 100
	});

	/**
	 * Set the block info
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	ElricScenario.setMethod(function setBlockInfo(all_blocks) {
		this.all_blocks = all_blocks;
	});

	/**
	 * Get all child blocks
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 *
	 * @return   {Array}
	 */
	ElricScenario.setMethod(function getBlocks() {
		return this.getElementsByNodeName('scenario-block');
	});

	/**
	 * Get child block by id
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	ElricScenario.setMethod(function getBlock(id) {
		return document.getElementById(id);
	});

	/**
	 * Get block date
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	ElricScenario.setMethod(function getBlockData() {

		var blocks = this.getBlocks(),
		    result = [],
		    block,
		    data,
		    i;

		// Iterate over all the blocks
		for (i = 0; i < blocks.length; i++) {
			block = blocks[i];

			data = {
				id           : block.id,
				type         : block.type,
				out_on_true  : block.getExitIds(true),
				out_on_false : block.getExitIds(false),
				settings     : block.options.settings || {},
				left         : parseInt(block.style.left),
				top          : parseInt(block.style.top)
			};

			result.push(data);
		}

		return result;
	});

	/**
	 * Set the scenario record
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	ElricScenario.setMethod(function setRecord(record) {

		var that = this,
		    blocks,
		    block,
		    i;

		// Store the scenario data
		this.data = record.Scenario;

		// Store the blocks
		this.blocks = this.data.blocks || [];

		// Add all the blocks
		for (i = 0; i < this.blocks.length; i++) {
			this.addBlock(this.blocks[i]);
		}

		// Get all the added blocks
		blocks = this.getElementsByNodeName('scenario-block');

		// Initialize the connections (only after all the blocks have been added)
		for (i = 0; i < blocks.length; i++) {
			block = blocks[i];
			block.initializeConnections();
		}

		// Listen for new connections
		jsPlumb.bind('connection', function onConnection(connInfo, originalEvent) {
			that.attachConnection(connInfo);
		});

		// Listen for deletec connections
		jsPlumb.bind('connectionDetached', function onDetach(connInfo, originalEvent) { 
			that.detachConnection(connInfo);
		});
	});

	/**
	 * Add a block element to the scenario
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 *
	 * @param    {String}   type     The type of block to add
	 * @param    {Object}   options  The options for this block
	 *
	 * @return   {ScenarioBlockElement}
	 */
	ElricScenario.setMethod(function addBlock(type, options) {

		var block;

		if (typeof type == 'object') {
			options = type;
			type = options.type;
		}

		if (!options) {
			options = {};
		}

		if (!options.type) {
			options.type = type;
		}

		// Create the block
		block = Hawkejs.createElement('scenario-block');

		// And set this as the parent
		block.initialize(this, options);

		return block;
	});

	/**
	 * Register a connection
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	ElricScenario.setMethod(function attachConnection(info) {
		console.log('Attachment:', info);
	});

	/**
	 * Detach a connection
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	ElricScenario.setMethod(function detachConnection(info) {
		console.log('Detachment:', info);
	});
};