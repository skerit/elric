/**
 * The Doek Manager Module
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 */
alchemy.create('ChimeraModule', function DoekManagerChimeraModule() {

	this.routeName = 'doek';

	this.actions = {
		index: {
			route: '/index',
			title: __('chimera', 'Index'),
			class: 'btn-primary',
			icon: 'list',
		},
		view: {
			route: '/view/:id',
			title: __('chimera', 'View'),
			icon: 'eye'
		},
		edit: {
			route: '/edit/:id',
			title: __('chimera', 'Edit'),
			icon: 'pencil'
		},
		add: {
			route: '/add',
			title: __('chimera', 'Add'),
			icon: 'plus'
		}
	};

	this.actionLists = {
		paginate: ['index', 'add'],
		record: ['view', 'edit']
	};

	/**
	 * The index view
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.0.1
	 * @version  0.1.0
	 */
	this.index = function index(render) {
		
		var tasks = {};
		
		// Prepare function to find all rooms
		tasks.rooms = function getRooms(callback) {
			Model.get('Room').find('all', function(err, results) {

				var rooms = [],
				    i;

				if (err) {
					return callback(err);
				}

				for (i = 0; i < results.length; i++) {
					rooms.push(results[i].Room);
				}

				callback(null, rooms);
			});
		}
		
		// Prepare function to find all roomElements
		tasks.elements = function(callback) {
			Model.get('RoomElement').find('all', function(err, results) {

				var elements = [],
				    i;

				if (err) {
					return callback(err);
				}

				for (i = 0; i < results.length; i++) {
					elements.push(results[i].RoomElement);
				}

				callback(null, elements);
			});
		};
		
		// Execute the find functions
		async.parallel(tasks, function(err, results) {

			render.viewVars.rooms = results.rooms;
			render.viewVars.elements = results.elements;
			render.viewVars.elementTypes = Object.keys(alchemy.shared('elementTypes'));
			
			render.view = 'doek/index';

			render();
		});
	};

	/**
	 * Configure the menu pieces
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.0.1
	 * @version  0.0.1
	 *
	 * @param   {Array}          entries    The current entries array
	 * @param   {String}         parent     Parent to use for all new entries
	 * @param   {MenuItemType}   mit        The ChimeraModuleMIT
	 * @param   {Object}         data       Menu piece record data
	 * @param   {Object}         settings   The settings to use
	 *
	 * @return  {Array}          The resulting entries
	 */
	this.configureMenuEntries = function configureMenuEntries(entries, parent, mit, data, settings) {

		var entry = alchemy.cloneSafe(settings);

		if (!entry.id) {
			entry.id = 'ChimeraMenuManager';
		}

		if (!entry.title) {
			entry.title = __('chimera', 'Doek');
		}

		entry.url = this.getActionUrl('index');
		entry.parent = parent;
		entry.greedy = this.getBaseUrl();

		if (!entry.icon) {
			entry.icon = 'picture';
		}

		entries[entry.id] = entry;
	};

});