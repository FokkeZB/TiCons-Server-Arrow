var fs = require('fs'),
	path = require('path'),
	_ = require('lodash'),
	async = require('async');

exports.purge = function purge(server) {
	var now = new Date().getTime();
	var CFG = server.config.app;

	server.logger.info('Purging...');

	fs.readdir(CFG.zipPath, function (err, files) {

		if (err) {
			return server.logger.error(JSON.stringify(err));
		}

		if (files.length === 0) {
			return server.logger.info('Nothing to purge');
		}

		async.map(files, function (file, next) {

			var filePath = path.join(CFG.zipPath, file);

			fs.stat(filePath, function (err, stats) {

				if (err) {
					server.logger.error(JSON.stringify(err));
					return next();
				}

				if (now - stats.mtime.getTime() > CFG.purgeInterval) {
					server.logger.info('Purging: ' + filePath);

					return fs.unlink(filePath, function (err) {

						if (err) {
							server.logger.error(JSON.stringify(err));
						}

						return next();
					});

				} else {
					server.logger.info('Keeping: ' + filePath);
				}

				return next();
			});
		});
	});
};

exports.toCamelCase = function toCamelCase(opts) {
	var camelCase = {};

	_.each(opts, function (val, key) {
		if (key.indexOf('-') !== -1) {
			key = _.map(key.split('-'), function (keyPart, index) {
				if (index !== 0) {
					keyPart = keyPart.charAt(0).toUpperCase() + keyPart.substr(1);
				}
				return keyPart;
			}).join('');
		}
		camelCase[key] = val;
	});

	return camelCase;
};

exports.toArgs = function toArgs(opts) {

	return _.map(opts, function (val, key) {
		var opt = '--' + key;

		if (typeof val !== 'boolean') {
			opt += ' ';

			if (typeof val === 'number') {
				opt += val.toString();
			} else if (typeof val === 'object') {
				opt += val.join(',');
			} else if (typeof val === 'string' && val.indexOf(' ') === -1) {
				opt += val;
			} else {
				opt += '"' + val + '"';
			}
		}

		return opt;

	}).join(' ');
};

exports.fixArrays = function fixArrays(req, prefix) {
	var CFG = req.server.config.app;

	req.params[prefix] = [];

	var ln = prefix.length + 1;

	_.each(req.params, function (val, key) {
		if (key.substr(0, ln) === prefix + '-') {

			// security check
			if (CFG[prefix][val]) {
				req.params[prefix].push(val);
			}

			delete req.params[key];
		}
	});
};
