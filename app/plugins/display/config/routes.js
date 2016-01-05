// Create a new "display" section
var display = Router.section('display', '/display');

display.get('Start', '/', 'Display#start');