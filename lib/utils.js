var _ = require('lodash');

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
