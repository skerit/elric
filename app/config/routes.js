// Create route with name "Home" that will execute the "home" method of the "Static" controller
Router.add({
	name       : 'Home',
	methods    : 'get',
	paths      : '/',
	handler    : 'Static#home',
	breadcrumb : 'static.home'
});