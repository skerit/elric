Router.get('Home', '/', 'Static#home');

Router.socket('ClientChimera#capconfig', 'capconfig');
Router.socket('DeviceChimera#command', 'devicecmd');
Router.socket('DeviceChimera#protocommand', 'protocolcmd');
Router.socket('FloorplanChimera#saveElement', 'saveelement');