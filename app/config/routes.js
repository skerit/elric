Router.get('Home', '/', 'Static#home');

Router.socket('DeviceChimera#command', 'devicecmd');
Router.socket('DeviceChimera#protocommand', 'protocolcmd');