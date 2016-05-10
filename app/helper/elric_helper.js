module.exports = function elricHelpers(Hawkejs, Blast) {

	var Elric = Hawkejs.Helper.extend(function ElricHelper(view) {
		ElricHelper.super.call(this, view);
	});

	/**
	 * Get a control element for a device feature 
	 *
	 * @author  Jelle De Loecker   <jelle@develry.be>
	 * @since   1.0.0
	 * @version 1.0.0
	 *
	 * @param   {Object}   feature
	 * @param   {Object}   device
	 *
	 * @return  {Element}
	 */
	Elric.setMethod(function getFeatureControl(feature, device) {

		var that = this,
		    element,
		    control;

		control = feature.control;

		// Return an async placeholder
		this.view.async(function doAsync(next) {

			var key;

			// Create the wanted element
			element = that.view.createElement(control.element);

			// Add the css class
			if (control.element == 'button') {
				element.classList.add('btn');
				element.classList.add('btn-success');
				element.textContent = feature.title;
			}

			// Set any required attributes
			if (control.attributes) {
				for (key in control.attributes) {
					element.setAttribute(key, control.attributes[key]);
				}
			}

			element.setAttribute('data-server-event', 'devicefeature | ' + device._id + ' | ' + feature.name);
			element.title = feature.description;

			if (control.send_value) {
				element.setAttribute('data-send-value', true);
			}

			// Attach the control configuration
			if (control.has_read_feature) {
				element.setAttribute('data-read-feature', true);

				that.view.helpers.Alchemy.getResource('read-device-feature', {feature: feature.name, device_id: device._id}, function gotFeatureState(err, result) {

					var val;

					if (err) {
						console.error('ERROR:', err);
						return next(null, element);
					}

					if (result != null) {
						if (typeof element.attach == 'function') {
							element.attach('feature_state', result);
						}

						if (typeof result != 'object') {
							val = result;
						} else if (result.element_value != null) {
							val = result.element_value;
						} else if (result.value != null) {
							val = result.value;
						}

						if (val != null) {
							element.setAttribute('value', val);
							element.value = val;
						}
					}

					next(null, element);
				});

				return;
			}

			next(null, element);
		});
	});

};