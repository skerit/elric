/**
 * The client indicator
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {Janeway} janeway   The parent janeway instance
 */
var Client = Function.inherits('Develry.Janeway.Indicator', function ClientIndicator(janeway, name, options) {

	ClientIndicator.super.call(this, janeway, name, options);

	// Set computer as the icon
	this.setIcon(' ');
});

/**
 * Set client status
 *
 * @author   Jelle De Loecker   <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 *
 * @param    {String}   reason   Optional reason for debug purposes
 */
Client.setMethod(function update(reason) {

	var hover_text = '',
	    max_length = 0,
	    max_right = 0,
	    separator,
	    status,
	    client,
	    name,
	    list,
	    conf,
	    i;

	if (!elric.clients) {
		return;
	}

	list = elric.clients.slice(0);
	list.sortByPath('hostname', 'ip');

	for (i = 0; i < list.length; i++) {
		client = list[i];

		status = client.status;
		name = client.hostname || client.ip || String(client._id);

		if (name.length > max_length) {
			max_length = name.length;
		}

		if (status.length > max_right) {
			max_right = status.length;
		}
	}

	max_length += 3;

	for (i = 0; i < list.length; i++) {
		client = list[i];

		status = client.status;
		name = client.hostname || client.ip || String(client._id);

		separator = ' '.multiply((max_length - name.length) + (max_right - status.length));

		if (hover_text) {
			hover_text += '\n';
		}

		hover_text += name + separator + status;
	}

	this.setHover(hover_text);
});