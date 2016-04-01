module.exports = function elricScenarioBlockElement(Hawkejs, Blast) {

	var styles = {
		connector_true : {
			lineWidth   : 5,
			strokeStyle : '#74A039',
			joinstyle   : 'round'
		},
		connector_false : {
			lineWidth   : 5,
			strokeStyle : '#E22607',
			joinstyle   : 'round',
			outlineColor: 'none',
			outlineWidth: 7
		},
		hover : {
			lineWidth   : 7,
			strokeStyle : '#E2AA00'
		}
	};

	/**
	 * The ElricScenario element
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	var Block = Function.inherits('Hawkejs.Element', function ScenarioBlock() {

		var that = this;

		ScenarioBlock.super.call(this);

		// Endpoints will be stored here
		this.endpoints = [];

		// Grab the title span
		this.title_span = this.grab('span', 'title');

		// Listen for doubleclicks
		this.addEventListener('dblclick', function onDblclick(e) {
			that.configure();
		});
	});

	/**
	 * Get the parent's jsPlumb instance
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setProperty(function jsPlumb() {
		return this.parentElement.jsPlumb;
	});

	/**
	 * Default block options
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setProperty('default_options', {
		type   : 'conditional',
		class  : '',
		top    : 60,
		left   : 100
	});

	/**
	 * Entrance endpoint
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setProperty('endpoint_entrance', {
		anchor: 'TopCenter',
		endpoint: 'Dot',
		paintStyle: {fillStyle: "#275D51", radius: 11},
		hoverPaintStyle: styles.hover,
		maxConnections: -1,
		dropOptions: {hoverClass: 'hover', activeClass: 'active'},
		isTarget: true,
		overlays: []
	});

	/**
	 * True endpoint
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setProperty('endpoint_true', {
		anchor     : 'BottomRight',
		endpoint   : 'Dot',
		paintStyle : {fillStyle: '#74A039', radius: 7},
		isSource   : true,
		maxConnections: -1,
		connector: ['Flowchart', {stub: [40, 60], gap: 10}],
		connectorStyle: styles.connector_true,
		hoverPaintStyle: styles.hover,
		connectorHoverStyle: styles.hover,
		dragOptions:{},
		overlays:[
			['Label', { 
				location: [0.5, 1.5], 
				label: 'True',
				cssClass: 'endpointLabelTrue'
			}]
		]
	});

	/**
	 * Throughput endpoint
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setProperty('endpoint_throughput', {
		anchor     : 'BottomCenter',
		endpoint   : 'Dot',
		paintStyle : {fillStyle: '#74A039', radius: 7},
		isSource   : true,
		maxConnections: -1,
		connector: ['Flowchart', {stub: [40, 60], gap: 10}],
		connectorStyle: styles.connector_true,
		hoverPaintStyle: styles.hover,
		connectorHoverStyle: styles.hover,
		dragOptions:{},
		overlays:[
			['Label', { 
				location: [0.5, 1.5], 
				label: '',
				cssClass: 'endpointLabelThroughput'
			}]
		]
	});

	/**
	 * Done endpoint
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setProperty('endpoint_done', {
		anchor     : 'BottomRight',
		endpoint   : 'Dot',
		paintStyle : {fillStyle: '#74A039', radius: 7},
		isSource   : true,
		maxConnections: -1,
		connector: ['Flowchart', {stub: [40, 60], gap: 10}],
		connectorStyle: styles.connector_true,
		hoverPaintStyle: styles.hover,
		connectorHoverStyle: styles.hover,
		dragOptions:{},
		overlays:[
			['Label', { 
				location: [0.5, 1.5], 
				label: 'Done',
				cssClass: 'endpointLabelDone'
			}]
		]
	});

	/**
	 * False endpoint
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setProperty('endpoint_false', {
		anchor: "BottomLeft",
		endpoint: "Dot",
		paintStyle: {fillStyle: "#E22607", radius: 7},
		isSource: true,
		maxConnections: -1,
		connector: ["Flowchart", {stub: [40, 60], gap: 10}],
		connectorStyle: styles.connector_false,
		hoverPaintStyle: styles.hover,
		connectorHoverStyle: styles.hover,
		dragOptions:{},
		overlays:[
			["Label", { 
				location: [0.5, 1.5], 
				label: "False",
				cssClass: "endpointLabelFalse" 
			}]
		]
	});

	/**
	 * False endpoint
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setProperty('endpoint_timeout', {
		anchor: "BottomLeft",
		endpoint: "Dot",
		paintStyle: {fillStyle: "#E22607", radius: 7},
		isSource: true,
		maxConnections: -1,
		connector: ["Flowchart", {stub: [40, 60], gap: 10}],
		connectorStyle: styles.connector_false,
		hoverPaintStyle: styles.hover,
		connectorHoverStyle: styles.hover,
		dragOptions:{},
		overlays:[
			["Label", { 
				location: [0.5, 1.5], 
				label: "Timeout",
				cssClass: "endpointLabelTimeout" 
			}]
		]
	});

	/**
	 * Open configuration
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setMethod(function configure() {

		var that = this,
		    update_config,
		    update_url,
		    config,
		    data,
		    url;

		// URL config for edit dialog
		config = {
			controller: 'Scenario',
			action: 'configure_block',

			// Supply the scenario id
			id: this.parentElement.id,

			// And the block id
			block_id: this.id
		};

		// Construct the url to save to
		url = hawkejs.scene.helpers.Router.routeUrl('chimera@IdActionLink', config);

		// URL config for update
		update_config = {
			controller: 'Scenario',
			action: 'configure_block',
			id: config.id,
			block_id: config.block_id
		};

		// Construct the update url
		update_url = hawkejs.scene.helpers.Router.routeUrl('chimera@IdActionLink', update_config);

		// Get the block settings values
		hawkejs.scene.fetch(url, function gotBlockData(err, cfields) {

			var variables;

			if (err) {
				return console.error('Failed to get configuration:', err);
			}

			variables = {
				cfields: cfields,
				block: that.type_config
			};

			// Render the block
			hawkejs.scene.render('elements/block_config', variables, function rendered(err, result) {

				var $intakes,
				    $editor,
				    saving,
				    $save;

				// Get the "editor", the config dialog we just opened
				$editor = $('.js-he-dialog[data-template="elements/block_config"]').last();

				// Get the save button
				$save = $('.block-save', $editor);

				// Bind to the save button
				$save.on('click', function onClick(e) {

					var data;

					if (saving) {
						return console.log('Already saving ...');
					}

					// Indicate we're already saving
					saving = true;

					// Add the saving class
					$save.addClass('saving');
					$save.addClass('btn-primary');

					// Remove optional class
					$save.removeClass('error');
					$save.removeClass('btn-danger');
					$save.removeClass('btn-success');
					$save.removeClass('saved');

					data = {};

					e.preventDefault();

					// Get all the intake fields
					$intakes = $('.chimeraField-intake', $editor);

					// Get the modified fields
					$intakes.each(function eachIntake() {

						var $wrapper = $(this),
						    instance = this.CFWrapper;

						// Skip nested wrappers,
						// this could mess up the data
						if (instance.nested_in) {
							return;
						}

						// Get ALL the data (not just updates)
						Object.merge(data, instance.getData(false));
					});

					// Overwrite the settings
					that.options.settings = data;

					// Post the config data
					hawkejs.scene.fetch(update_url, {post: {data: data}}, function saved(err, result) {

						$save.removeClass('btn-primary');
						$save.removeClass('saving');
						saving = false;

						if (err) {
							$save.addClass('error');
							$save.addClass('btn-danger');
							return console.error('Save failed!', err);
						}

						$save.addClass('saved');
						$save.addClass('btn-success');

						// Update the description
						that.updateDescription();
					});
				});
			});
		});

	});

	/**
	 * Get entrance node
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setMethod(function getEntranceNode() {
		return this.jsPlumb.getEndpoint(this.id + '-entrance');
	});

	/**
	 * Get exit name
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setMethod(function getExitName(value) {

		var bool = !!value,
		    name;

		if (bool) {
			name = this.type_config.exit_names[0];
		} else {
			name = this.type_config.exit_names[1];
		}

		return name;
	});

	/**
	 * Get exit node
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setMethod(function getExitNode(value) {

		var name = this.getExitName(value),
		    node;

		node = this.jsPlumb.getEndpoint(this.id + '-' + name);

		return node;
	});

	/**
	 * Get exit connections
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setMethod(function getExitConnections(value) {

		var node = this.getExitNode(value);

		if (node) {
			return node.connections;
		}

		return [];
	});

	/**
	 * Get exit ids
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setMethod(function getExitIds(value) {

		var connections = this.getExitConnections(value),
		    result = [],
		    conn,
		    i;

		for (i = 0; i < connections.length; i++) {
			conn = connections[i];

			if (conn.targetId) {
				result.push(conn.targetId);
			}
		}

		return result;
	});

	/**
	 * Add an endpoint anchor
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setMethod(function addEndpoint(name) {

		var point_name,
		    endpoint,
		    options,
		    style;

		// Construct the property name
		point_name = 'endpoint_' + name;

		// Get the style
		style = this[point_name];

		if (!style) {
			throw new Error('Could not find endpoint type "' + name + '"');
		}

		options = {
			uuid: this.id + '-' + name
		};

		endpoint = this.jsPlumb.addEndpoint(this.id, style, options);

		this.endpoints.push(endpoint);
	});

	/**
	 * Add a block element to the scenario
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setMethod(function initialize(parent, options) {

		var blocks = parent.all_blocks,
		    block,
		    id,
		    i;

		options = Object.assign({}, this.default_block_options, options);

		// Get the block definition
		block = blocks[options.type];

		// Store the type config
		this.type_config = block;

		// Store the type name
		this.type = block.name;

		// Set the title
		this.title_span.innerText = block.title;

		if (!options.id) {
			options.id = Blast.createObjectId();
		}

		// Store the options
		this.options = options;

		// Set the id
		this.id = options.id;

		// Set the datatype
		this.dataset.type = options.type;

		// Add this block to the parent
		parent.appendChild(this);

		// Set the position
		this.style.top = options.top + 'px';
		this.style.left = options.left + 'px';

		// Add an entrance point if this block has one
		if (block.has_entrance) {
			this.addEndpoint('entrance');
		}

		for (i = 0; i < block.exit_names.length; i++) {
			this.addEndpoint(block.exit_names[i]);
		}

		// Only do this once
		if (!this._initialized) {
			this._initialized = true;

			// Set the description
			this.updateDescription();

			// Make this block draggable
			this.jsPlumb.draggable(this);
		}
	});

	/**
	 * Initialize connections
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setMethod(function initializeConnections() {

		var id,
		    i;

		// @TODO: use options.out_on_false and out_on_true
		// which are IDs
		for (i = 0; i < this.options.out_on_true.length; i++) {
			id = this.options.out_on_true[i];

			if (!id) {
				continue;
			}

			this.connect(id, true);
		}
	});

	/**
	 * Connect this block to another one
	 * through the given anchors
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	Block.setMethod(function connect(block_id, source_value) {

		var target_block,
		    source,
		    target;

		// Get the target block element
		target_block = this.parentElement.getBlock(block_id);

		if (!target_block) {
			throw new Error('Could not find block "' + block_id + '"');
		}

		// Get the target entrance
		target = target_block.getEntranceNode();

		if (!target) {
			throw new Error('Target block "' + block_id + '" has no entrance');
		}

		// Get the source exit node
		source = this.getExitNode(source_value);

		if (!source) {
			throw new Error('Could not find source exit node "' + !!source_value + '"');
		}

		this.jsPlumb.connect({
			source  : source,
			target  : target
		});
	});

	/**
	 * Update the block description
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 *
	 * @param    {Function}   callback
	 */
	Block.setMethod(function updateDescription(callback) {

		var that = this;

		this.getDescription(function gotDescription(err, description) {

			if (err) {
				if (callback) {
					callback(err);
				}
				return;
			}

			that.innerText = description;

			if (callback) {
				callback(null, description);
			}
		});
	});

	/**
	 * Get the block description
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 *
	 * @param    {Function}   callback
	 */
	Block.setMethod(function getDescription(callback) {

		var that = this,
		    config,
		    url;

		config = {
			controller: 'Scenario',
			action: 'block_description',
			id: this.parentElement.id,
			block_id: this.id
		};

		// Construct the url to save to
		url = hawkejs.scene.helpers.Router.routeUrl('chimera@IdActionLink', config);

		hawkejs.scene.fetch(url, function gotResponse(err, res) {

			if (err) {
				return callback(err);
			}

			if (!res || typeof res.description == 'undefined') {
				return callback(new Error('No description given'));
			}

			callback(null, res.description);
		});
	});

};