module.exports = function AlchemyVideoElement(Hawkejs, Blast) {

	/**
	 * The AlchemyVideo element
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	var AlVideo = Function.inherits('Hawkejs.Element', function AlVideo() {
		AlVideo.super.call(this);

		// Initialize this element
		this.init();
	});

	/**
	 * Is this the main player on the page?
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 *
	 * @type     {Boolean}
	 */
	AlVideo.setProperty('is_main', false);

	/**
	 * Is this element full-screen?
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 *
	 * @type     {Boolean}
	 */
	AlVideo.setProperty('is_fullscreen', false);

	/**
	 * Video duration getter
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @return   {Number}
	 */
	AlVideo.setProperty(function duration() {

		var result;

		if (this.current_source && this.current_source.duration != null) {
			return this.current_source.duration;
		}

		if (isFinite(this.el_video.duration)) {
			return this.el_video.duration;
		}

		if (this.default_duration) {
			return this.default_duration;
		}

		return 0;
	});

	/**
	 * Current time getter
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 *
	 * @return   {Number}
	 */
	AlVideo.setProperty(function currentTime() {
		return this.el_video.currentTime;
	});

	/**
	 * Initialize this element
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	AlVideo.setMethod(function init() {

		// Create the video element, add the 'video' class
		this.el_video = this.grab('video', 'video');

		// Same for audio
		this.el_audio = this.grab('audio', 'audio');

		// Create a div for the controls
		this.el_controls = this.grab('div', 'controls');

		// Create a div for the cover
		this.el_cover = this.grab('div', 'cover');

		this.createLink();
	});

	/**
	 * Create a link to the server with the attached configuration
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	AlVideo.setMethod(function createLink() {

		var that = this,
		    config;

		if (Blast.isNode) {
			return;
		}

		console.log('Attachments:', this.attachments, this);

		if (!this.attachments.link_config) {
			return;
		}

		console.log('Creating link?', typeof hawkejs);

		Blast.after('alchemy-loaded', function gotAlchemy() {

			config = that.attachments.link_config;

			// Create the linkup
			that.link = alchemy.linkup(config.linkup, config);

			console.log('Created link:', that.link);

			// Listen for streams
			that.link.on('stream', function gotStream(data, stream) {
				console.log('Got linkup stream:', data, stream);
				that.playStream(stream, data);
			});
		});
	});

	/**
	 * Check the buffer and see if we need to make a new request
	 *
	 * @author   Jelle De Loecker   <jelle@develry.be>
	 * @since    0.1.0
	 * @version  0.1.0
	 */
	AlVideo.setMethod(function checkBuffer(current_time) {

		if (this.current_source) {
			return this.current_source.checkBuffer(current_time);
		}

		return false;
	});

	/**
	 * Does the current source have the requested time available
	 *
	 * @author        Jelle De Loecker   <jelle@develry.be>
	 * @since         0.1.0
	 * @version       0.1.0
	 */
	AlVideo.setMethod(function hasTime(value) {

		if (this.current_source) {
			return this.current_source.hasTime(value);
		}

		return false;
	});

	/**
	 * Indicate the given range is being downloaded
	 *
	 * @author        Jelle De Loecker   <jelle@develry.be>
	 * @since         0.1.0
	 * @version       0.1.0
	 */
	AlVideo.setMethod(function registerRange(start, end) {

		if (this.current_source) {
			return this.current_source.registerRange(start, end);
		}

		return false;
	});

	/**
	 * See if we need to fetch any range
	 *
	 * @author        Jelle De Loecker   <jelle@develry.be>
	 * @since         0.1.0
	 * @version       0.1.0
	 */
	AlVideo.setMethod(function calculateRangeToFetch(start, end) {

		if (this.current_source) {
			return this.current_source.calculateRangeToFetch(start, end);
		}

		return false;
	});

	/**
	 * Start playing the video
	 *
	 * @author        Jelle De Loecker   <jelle@develry.be>
	 * @since         0.1.0
	 * @version       0.1.0
	 */
	AlVideo.setMethod(function play() {
		this.el_video.play();
	});

	/**
	 * Pause the video
	 *
	 * @author        Jelle De Loecker   <jelle@develry.be>
	 * @since         0.1.0
	 * @version       0.1.0
	 */
	AlVideo.setMethod(function pause() {
		this.el_video.pause();
	});

	/**
	 * Seek to the requested time
	 *
	 * @author        Jelle De Loecker   <jelle@develry.be>
	 * @since         0.1.0
	 * @version       0.1.0
	 */
	AlVideo.setMethod(function seek(value) {

		var that = this,
		    min = ~~(value / 10) * 10,
		    max = min + this.segment_length;

		// Store the value we last seeked to
		this.last_seek = value;

		this.current_source.requestRange(min, max, false, function gotRange() {

			// If another seek happened in the mean time, ignore this range response
			if (that.last_seek != value) {
				return;
			}

			// If the requested start time isn't available yet, wait another second
			if (!that.hasTime(value)) {
				return setTimeout(gotRange, 1000);
			}

			// Update the video time
			that.el_video.currentTime = value;

			// Resume the video
			that.play();
		});
	});

	/**
	 * Toggle fullscreen
	 *
	 * @author        Jelle De Loecker   <jelle@develry.be>
	 * @since         0.1.0
	 * @version       0.1.0
	 */
	AlVideo.setMethod(function toggleFullScreen() {
		this.setFullScreen(!this.is_fullscreen);

		return this.is_fullscreen;
	});

	/**
	 * Set the fullscreen
	 *
	 * @author        Jelle De Loecker   <jelle@develry.be>
	 * @since         0.1.0
	 * @version       0.1.0
	 */
	AlVideo.setMethod(function setFullScreen(value) {

		var element = this.wrap;

		if (value == null) {
			value = true;
		}

		if (value) {
			if (element.requestFullscreen) {
				element.requestFullscreen();
			} else if (element.mozRequestFullScreen) {
				element.mozRequestFullScreen(); // Firefox
			} else if (element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen(); // Chrome and Safari
			}

			this.is_fullscreen = true;
		} else {
			if (document.cancelFullscreen) {
				document.cancelFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen(); // Firefox
			} else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen(); // Chrome and Safari
			}

			this.is_fullscreen = false;
		}

		return this.is_fullscreen;
	});

	/**
	 * Move the video player to the given element
	 *
	 * @author        Jelle De Loecker   <jelle@develry.be>
	 * @since         0.1.0
	 * @version       0.1.0
	 */
	AlVideo.setMethod(function moveTo(element) {

		if (typeof element == 'string') {
			element = document.querySelector(element);
		}

		this.element = element;

		// Clear the video central content
		this.element.innerHTML = '';

		// Make sure it's visible
		this.element.style.display = '';

		// Add this video
		this.element.appendChild(this.wrap);
	});

	/**
	 * Play a stream
	 *
	 * @author        Jelle De Loecker   <jelle@develry.be>
	 * @since         0.1.0
	 * @version       0.1.0
	 */
	AlVideo.setMethod(function playStream(stream, data) {

		var that = this,
		    source;

		if (!data) {
			data = {};
		}

		// Unset the play id
		this.setPlayId(null);

		source = new Blast.Classes.Develry.PlaySource(this, stream, data);

		this.current_source = source;
		this.option_id = data.option_id;

		// Start playing the video
		this.el_video.play();

		// Make sure to start at the correct timestamp
		source.on('start_time', function gotStartTime(timestamp) {
			console.log('Start time')
			if (timestamp > 0) {
				that.el_video.currentTime = timestamp;
			}
		});

		// Make sure the cover is hidden
		this.el_cover ? this.el_cover.hidden = true : null;
		this.el_loader ? this.el_loader.hidden = true : null;

		return source;
	});

	/**
	 * Set the identifier of the video that is playing
	 *
	 * @author        Jelle De Loecker   <jelle@develry.be>
	 * @since         0.1.0
	 * @version       0.1.0
	 */
	AlVideo.setMethod(function setPlayId(id) {
		this.play_id = id;
	});

	/**
	 * The element has been undried (revived)
	 *
	 * @author        Jelle De Loecker   <jelle@develry.be>
	 * @since         0.1.0
	 * @version       0.1.0
	 */
	AlVideo.setMethod(function undried() {
		this.createLink();
	});

	/**
	 * Listen for the link config object
	 *
	 * @author   Jelle De Loecker <jelle@develry.be>
	 * @since    1.0.0
	 * @version  1.0.0
	 */
	AlVideo.monitor('link_config', function onLinkConfig(config) {
		this.createLink();
	});

};