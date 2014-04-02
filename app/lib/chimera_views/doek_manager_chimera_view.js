var async = alchemy.use('async'),
    MenuItemTypes = alchemy.shared('Menu.itemTypes');

function getMenuItemTypes() {

	var result = {},
	    key;

	for (key in MenuItemTypes) {

		result[key] = {
			title: key.titleize(),
			id: key
		};
	}

	return result;
}

/**
 * The basic index page
 *
 * @author   Jelle De Loecker   <jelle@codedor.be>
 * @since    0.0.1
 * @version  0.0.1
 */
alchemy.create('ChimeraView', function MenuManagerChimeraView() {

	/**
	 * Build the edit view
	 *
	 * @author   Jelle De Loecker   <jelle@codedor.be>
	 * @since    0.0.1
	 * @version  0.0.1
	 */
	this.edit = function edit(render, module, options) {

		var that       = this,
		    conditions = {},
		    urlParams  = render.req.route.params,
		    groupName,
		    fieldName,
		    fields,
		    groups,
		    model,
		    group,
		    field,
		    temp,
		    i;

		if (typeof options !== 'object') {
			options = {};
		}

		// Get the model
		model = this.getModel('Menu');

		// Set the view file
		render.view = 'chimera/menu_manager';
		
		render.viewVars.postUrl = module.getActionUrl('edit', urlParams);
		render.viewVars.pieceUrl = module.getActionUrl('configure');
		render.viewVars.newPiece = module.getActionUrl('addPiece', urlParams);
		render.viewVars.MenuItemTypes = getMenuItemTypes();

		conditions['_id'] = render.req.params.id;

		if (render.get) {

			async.parallel([
				function getMenuSource(done) {
					model.getSource(render.req.params.id, function(err, source) {
						render.viewVars.menuSource = source;
						done();
					});
				},
				function getMenuRecord(done) {
					model.find('first', {conditions: conditions}, function(err, item) {

						var original   = model.name.modelName();

						item = item[0];
						
						render.viewVars.__current__ = item;
						render.viewVars.item = item;
						render.viewVars.originalItem = item;
						render.viewVars.routeVars.id = item[original]._id;
						render.viewVars.menuName = item[original].name;
						render.viewVars.menuId = item[original]._id;

						done();
					});
				}
			], function asyncDone() {
				render();
			});
			
		} else if (render.post) {

		}
	};

	this.configure = function configure(render, module, options) {

		var that = this,
		    pieceId = render.req.params.pieceid,
		    Menu    = this.getModel('Menu'),
		    MP      = this.getModel('MenuPiece'),
		    body    = render.req.body,
		    data,
		    type,
		    obj,
		    ME,
		    M;

		render.view = 'chimera/menu_piece_configure';
		ME = module.getView('ModelEditor');
		data = body.data;

		if (body.delete) {
			MP.remove(pieceId, function(err) {
				render.viewVars.pieceErr = err;
				render();
			});

			return;
		}

		// Create a new menu piece if needed
		if (data && body.create) {

			if (!render.post) {
				// @todo: correctly cancel or redirect
				return;
			}

			type = Menu.getItemType(pieceId);

			obj = {};
			obj.settings = type.cloneDefaultSettings();
			obj.settings.order = data.ModelEditorField.order;
			obj.type = pieceId;
			obj.menu_id = render.req.body.menuId;

			MP.save(obj, function(err, results) {

				if (err || (results[0] && results[0].err)) {

					render.setFlash(__('menu', 'Error adding menu piece'), 'error');

					// @todo: redirect or cancel
					return;
				}
				
				render.req.params.pieceid = results[0].item._id;

				render.setFlash(__('menu', 'Menu piece has been added'), 'success');

				delete render.req.body.create;
				
				// Refire the function
				that.configure(render, module, options);
			});

			return;
		}

		MP.find('first', {conditions: {_id: pieceId}}, function(err, result) {

			result = result[0];

			var piece = result.MenuPiece,
			    type  = Menu.getItemType(piece.type),
			    originalsettings,
			    fields,
			    data;

			if (render.post) {
				data = render.req.body;

				if (data && data.data) {
					data = data.data.ModelEditorField;
				}

				originalsettings = piece.settings;
				piece.settings = data;
			}

			m = module.getModule('ModelEditor');
			
			ME.getModelGroups(type, piece, function(groups) {

				fields = ME.getGroupFields(groups, piece);

				render.viewVars.piece = piece;
				render.viewVars.blueprint = type.blueprint;
				render.viewVars.__groups = groups;
				render.viewVars.pieceTitle = type.getPieceTitle(piece);

				if (render.post) {
					
					ME.prepareSave(piece.settings, {
						module: m,
						model: that,
						fields: fields
					}, function(err, newdata) {
						
						// Merge the new settings data into the original settings
						piece.settings = alchemy.merge(originalsettings, newdata);

						// @todo: this could be cleaned up a bit!
						MP.save(piece, function(err, results) {

							if (err) {
								render.setFlash(__('menu', 'Error saving menu piece'), 'error');
							} else {
								render.setFlash(__('menu', 'Menu piece has been saved'), 'success');
							}

							render.viewVars.piece = results[0].item;

							ME.getModelGroups(type, results[0].item, function(__groups) {

								render.viewVars.__groups = __groups;
								fields = ME.getGroupFields(render.viewVars.__groups, render.viewVars.piece);

								ME.prepareFields({
									module: m,
									model: that,
									item: render.viewVars.piece.settings,
									fields: fields,
									context: type
								}, function afterPrepareFields() {
									render();
								});
							});
						});

					});
				} else {
					ME.prepareFields({
						module: m,
						model: that,
						item: piece.settings,
						fields: fields,
						context: type
						}, function afterPrepareFields() {
						render();
					});
				}
			});
		});
	};

});