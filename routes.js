var bcrypt = require('bcrypt');

module.exports = function Routes (app, models) {
	
	/**
	 * Login routes
	 */
	app.get('/login', function (req, res) {
		res.render('login');
	});
	
	app.post('/login', function (req, res) {
		models.User.findOne({username: req.body.username}, function(err, user) {
			if (user === null) { // No users found
				res.send({ error: 'User not found!', errors: err });
			} else {
				// See if password matches
				var passMatch = bcrypt.compareSync(req.body.password, user.password);
				
				if (passMatch) {
					req.session.user = user;
					res.send({ success: 'Saved!', redirect: '/'});
				} else {
					res.send({ error: 'Password did not match!', errors: err });
				}
				
			}
		});
	});
	
}