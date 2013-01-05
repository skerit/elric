module.exports = function FirstRun (elric) {
	
	// Catch any GET request
	elric.app.get('*', function(req, res) {
		res.render('firstrun');
	});
	
	// Catch the create POST
	elric.app.post('/create', function(req, res){
		var firstUser = new elric.models.user.model(req.body);
		firstUser.save(function (err) {
			if (err) {
				res.send({ error: 'Saving first user failed!', errors: err });
			} else {
				
				// Now start using the correct routes!
				elric.app.initializeRoutes();
				
				// @todo: LOGIN before redirect!
				res.send({ success: 'Saved!', redirect: '/'});
				
			}
    });
	});
	
}