return;
var async = alchemy.use('async');

/**
 * The Capability Module
 *
 * @author   Jelle De Loecker   <jelle@kipdola.be>
 * @since    0.1.0
 * @version  0.1.0
 */
alchemy.create('ChimeraModule', function ClientChimeraModule() {

	this.routeName = 'client';

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
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	this.index = function index(render) {

		var Paginate = Component.get('Paginate'),
		    Client   = this.getModel('Client');

		Paginate.find(Client, function(err, items) {

			render.viewVars.items = items;

			render('client/index');
		});
	};
});