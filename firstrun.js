module.exports = function FirstRun (app, models) {
	
	// Catch any GET request
	app.get('*', function(req, res) {
		res.render('firstrun');
	});
	
	// Catch the create POST
	app.post('/create', function(req, res){
		var firstUser = new models.User(req.body);
		firstUser.save(function (err) {
			if (err) {
				res.send({ error: 'Saving first user failed!', errors: err });
			} else {
				
				// Now start using the correct routes!
				app.initializeRoutes();
				
				// @todo: LOGIN before redirect!
				res.send({ success: 'Saved!', redirect: '/'});
				
			}
    });
	});
	
}