hawkejs.scene.on({type: 'set', template: 'soundbite/chimera_bite_index', name: 'chimera-cage'}, function onBiteIndex(el, vars) {

	var tag_url = hawkejs.scene.helpers.Router.routeUrl('Tags#select'),
	    newTags = {};

	var select_options = {
		valueField: '_id',
		labelField: 'name',
		searchField: 'name',
		preload: true,
		load: function doLoad(query, callback) {

			var that = this,
			    $row = this.$input.parents('tr'),
			    url,
			    id = $row.data('id'),
			    i;

			url = hawkejs.scene.helpers.Router.routeUrl('chimera@ActionLink', {
				controller: 'Soundbite',
				action    : 'bite_record',
				id        : id
			});

			hawkejs.scene.fetch(url, function gotTags(err, record) {

				if (err) {
					throw err;
				}

				// Look for initial load
				if (!that.initted) {
					that.initted = true;

					if (!record || !record.tag_id || !record.tag_id.length) {
						that.init_values_set = true;
						return;
					}

					hawkejs.scene.fetch(tag_url, {get: {tag_id: record.tag_id}}, function gotResponse(err, data) {

						if (err) {
							console.error('Could not init select: ' + err);
							return callback([]);
						}

						// Callback with the data
						callback(data);

						// And select the initial tags
						that.setValue(record.tag_id, true);
						that.init_values_set = true;
					});
				} else {
					hawkejs.scene.fetch(tag_url, {get: {q: query}}, function gotResponse(err, data) {

						if (err) {
							console.error('Could not query: ' + err);
							return callback([]);
						}

						callback(Object.values(newTags).concat(data));
					});
				}
			});
		},
		create: function create(input, callback) {

			// Create the tag in the database
			hawkejs.scene.fetch(tag_url, {post: {name: input}}, function gotResponse(err, data) {

				if (err) {
					return console.error('Could not create: ' + err);
				}

				// Store it in the newTags object,
				// so future references can use the correct id
				newTags[input] = data;

				callback(data);
			});
		},
		onItemRemove: function onRemove(value) {
			updateTags(this);
		},
		onItemAdd: function onItemAdd(value, $el) {
			updateTags(this);
		}
	};

	function updateTags(element) {
		console.log('Update tags?', element);
	}

	$('.play-bite').on('click', function onClick(e) {

		var $this   = $(this),
		    bite_id = $this.parents('tr').data('id'),
		    sound,
		    url;

		e.preventDefault();

		if (!bite_id) {
			return console.error('No soundbite id found');
		}

		url = hawkejs.scene.helpers.Router.routeUrl('chimera@ActionLink', {
			controller: 'Soundbite',
			action    : 'audiofile',
			id        : bite_id
		});

		sound = new Audio(url);
		sound.play();
	});

	hawkejs.require(['jquery', 'selectize/0.12/selectize'], function gotScripts() {
		$('.tag-input').each(function eachTagInput() {
			$(this).selectize(select_options);
		});
	});

	// Update fields on change
	$('.ajax-update').on('change', function onChange() {

		var $this = $(this),
		    $row = $this.parents('tr'),
		    id = $row.data('id'),
		    field_name = this.getAttribute('name'),
		    value = this.value,
		    data = {},
		    url;

		if ($this.attr('type') == 'checkbox') {
			value = this.checked;
		}

		data[field_name] = value;

		url = hawkejs.scene.helpers.Router.routeUrl('chimera@ActionLink', {
			controller: 'Soundbite',
			action    : 'bite_record',
			id        : id
		});

		hawkejs.scene.fetch(url, {post: {data: data}}, function updated() {

		});
	})
});