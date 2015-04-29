var Arrow = require('arrow'),
	path = require('path'),
	uuid = require('node-uuid'),
	async = require('async'),
	archiver = require('archiver'),
	_ = require('lodash'),
	fs = require('fs-extra'),
	ticons = require('ticons'),
	utils = require('../../lib/utils'),
	tiConstants = require('../../node_modules/ticons/lib/constants');

var Route = Arrow.Router.extend({
	name: 'index_post',
	path: '/',
	method: 'POST',
	action: function (req, resp, next) {
		var server = req.server;
		var CFG = server.config.app;

		// convert to bool
		req.params.alloy = !!req.params.alloy;
		req.params.label = !!req.params.label;
		req.params['no-nine'] = !req.params['no-nine'];
		req.params['no-crop'] = !req.params['no-crop'];
		req.params['no-fix'] = !req.params['no-fix'];

		// convert to int
		req.params['min-dpi'] = parseInt(req.params['min-dpi'], 10);
		req.params['max-dpi'] = parseInt(req.params['max-dpi'], 10);
		req.params.width = req.params.width ? parseInt(req.params.width, 10) : undefined;
		req.params.height = req.params.height ? parseInt(req.params.height, 10) : undefined;
		req.params.radius = parseInt(req.params.radius, 10);

		// fix arrays
		utils.fixArrays(req, 'outputs');
		utils.fixArrays(req, 'platforms');
		utils.fixArrays(req, 'orientations');

		if (req.params.locale !== '' && !/^[a-z]{2}/.test(req.params.locale)) {
			return respond(req, resp, 'Invalid language.');
		}

		var doIcons = req.params.outputs.indexOf('icons') !== -1;
		var doSplashes = req.params.outputs.indexOf('splashes') !== -1;

		if (!doIcons && !doSplashes) {
			return respond(req, resp, 'Select an output.');
		}

		var iconsOpts, splashesOpts;

		resp.locals.examples = {};

		if (doIcons) {
			iconsOpts = select(req, resp, 'icons');
		}

		if (doSplashes) {
			splashesOpts = select(req, resp, 'splashes');
		}

		if (req.files.input.filename === '' || req.files.input.mimetype !== 'image/png') {
			return respond(req, resp, 'Input is missing or no PNG file.');
		}

		var name = uuid.v1();
		var fileName = name + '.zip';
		var tmpPath = path.join(CFG.tmpPath, name);
		var zipUrl = path.join(CFG.zipUrl, fileName);
		var zipPath = path.join(CFG.zipPath, fileName);

		async.series({

			icons: function (next) {

				if (!doIcons) {
					return next();
				}

				iconsOpts.outputDir = tmpPath;

				ticons.icons(iconsOpts, next);
			},

			splashes: function (next) {

				if (!doSplashes) {
					return next();
				}

				splashesOpts.outputDir = tmpPath;

				ticons.splashes(splashesOpts, next);
			},

			zip: function (next) {
				zip({
					input: tmpPath,
					output: zipPath
				}, next);
			}

		}, function (ticonsErr, results) {
			var errors = [];

			if (ticonsErr) {
				server.logger.error(ticonsErr);
				errors.push(ticonsErr.toString());
			}

			return fs.remove(tmpPath, function (removeErr) {

				if (removeErr) {
					server.logger.error(removeErr);
					errors.push(removeErr.toString());
				}

				if (ticonsErr) {
					return respond(req, resp, errors);
				}

				return respond(req, resp, {
					zipUrl: zipUrl
				});
			});
		});
	}
});

function respond(req, resp, opts) {
	var CFG = req.server.config.app;

	if (_.isArray(opts)) {
		opts = {
			errors: opts
		};
	} else if (_.isString(opts)) {
		opts = {
			errors: [opts]
		};
	} else if (!_.isObject(opts)) {
		opts = {};
	}

	opts.dpi = tiConstants.dpi;
	opts.orientations = CFG.orientations;
	opts.outputs = CFG.outputs;
	opts.params = _.defaults(req.params, CFG.defaults);
	opts.platforms = CFG.platforms;

	resp.render('index', opts);
}

function zip(opts, callback) {
	var output = fs.createOutputStream(opts.output);
	var archive = archiver('zip');

	output.on('close', callback);
	archive.on('error', callback);

	archive.pipe(output);

	archive.bulk([{
		expand: true,
		cwd: opts.input,
		src: ['**/*']
	}]);

	archive.finalize();
}

function select(req, resp, output) {
	var CFG = req.server.config.app;

	var args = {
		'output-dir': 'path/to/your/project',
		'alloy': req.params.alloy,
		'platforms': req.params.platforms
	};

	var keys = ['min-dpi', 'max-dpi', 'label'];

	if (output === 'icons') {
		keys.push('radius');
	} else {
		keys.push('locale', 'orientation', 'width', 'height', 'no-nine', 'no-crop', 'no-fix');
	}

	keys.forEach(function (key) {
		if (req.params[key] !== CFG.defaults[key] && req.params[key] !== '') {
			args[key] = req.params[key];
		}
	});

	resp.locals.examples[output] = {};
	resp.locals.examples[output].cli = 'ticons ' + output + ' path/to/image.png ' + utils.toArgs(args);
	var opts = utils.toCamelCase(args);
	opts.input = 'path/to/your/image.png';
	resp.locals.examples[output].module = 'ticons.' + output + '(' + JSON.stringify(opts, null, '  ') + ', function(err, files) {});';
	opts.input = req.params.input;

	return opts;
}

module.exports = Route;
