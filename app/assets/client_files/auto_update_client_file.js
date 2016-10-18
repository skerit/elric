var exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    updating = false;

/**
 * The AutoUpdate ClientFile
 *
 * @constructor
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
var Auto = Function.inherits('ClientFile', function AutoUpdateClientFile(client, settings) {

	var that = this;

	// Call the parent constructor
	AutoUpdateClientFile.super.call(this, client, settings);

	// Old, mp3 stream way
	this.onLinkup('check_update', function onCheckUpdate(linkup, data) {

		console.log('Should check for client update:', linkup, data);
		that.checkUpdate(data, linkup);
	});
});

/**
 * Startup!
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Auto.setMethod(function start(callback) {

	var that = this,
	    device;

	callback();
});

/**
 * Stop
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Auto.setMethod(function stop() {
	// Nothing
});

/**
 * Actually check for an  update
 *
 * @author   Jelle De Loecker <jelle@develry.be>
 * @since    0.1.0
 * @version  0.1.0
 */
Auto.setMethod(function checkUpdate(data, linkup, callback) {

	var that = this,
	    options,
	    errmsg,
	    stage;

	if (updating) {
		// @TODO: return linkup error
		return;
	}

	updating = true;

	if (!callback) {
		callback = Function.thrower;
	}

	options = {
		cwd      : PATH_ROOT,
		encoding : 'utf8'
	};

	Function.series(function doReset(next) {

		// Skip reset stage for now
		return next();

		stage = 'reset';

		elric.setStatus('Resetting git project', false, 'dots');

		// Hard-reset the folder first
		exec('git reset --hard HEAD', options, function doneReset(err, stdout, stderr) {

			if (err) {
				errmsg = stdout;
				return next(err);
			}

			if (stdout.indexOf('HEAD is now at') == -1) {
				errmsg = stdout;
				return next(new Error('Git reset failed'));
			}

			linkup.submit('report', {stage: stage, reset: true});

			next();
		});
	}, function doPull(next) {

		stage = 'pull';

		elric.setStatus('Pulling in git changes', false, 'dots');

		exec('git pull', options, function donePull(err, stdout, stderr) {

			console.log('[Autoupdate] Pull:', String(stdout))
			console.log('------:', String(stderr));

			if (err) {
				return next(err);
			}

			linkup.submit('report', {stage: stage, pull: true});

			next();
		});
	}, function doNpmUpdate(next) {

		var stderr = '',
		    proc;

		stage = 'update';

		elric.setStatus('Updating npm modules', false, 'simpleDotsScrolling');

		// Don't do "update", that'll mess up symlinked modules aswel
		proc = spawn('npm', ['install'], options);

		proc.stdout.on('data', function onData(data) {
			console.log('Stdout: ' + data);
		})

		proc.stderr.on('data', function onStderr(data) {
			stderr += data;
		});

		proc.on('close', function donePull(code) {

			if (code) {
				errmsg = stderr;
				return next(new Error('Process exited with code ' + code));
			}

			linkup.submit('report', {stage: stage, update: true});

			next();
		});
	}, function done(err) {

		if (err) {

			elric.setStatus('Failed to update npm modules');

			if (errmsg) {
				errmsg = errmsg.trim();
			}

			linkup.submit('report', {stage: stage, error: err, errmsg: errmsg});
			return callback(err);
		}

		elric.setStatus('Updated npm modules');
		linkup.submit('report', {done: true});

		callback();
	});
});

module.exports = Auto.create;