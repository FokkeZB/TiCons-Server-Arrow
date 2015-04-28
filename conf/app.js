var path = require('path');

module.exports = {
	app: {
		tmpPath: path.join(__dirname, '..', 'tmp'),
		zipUrl: '/download',
		zipPath: path.join(__dirname, '..', 'web', 'public', 'download'),
		purgeInterval: 1000 * 60 * 15,
		platforms: {
			'iphone': 'iPhone',
			'ipad': 'iPad',
			'android': 'Android',
			'mobileweb': 'Mobile Web',
			'blackberry': 'BlackBerry',
			'tizen': 'Tizen',
			'apple-watch': 'Apple Watch'
		},
		orientations: {
			'portrait': 'Portrait',
			'landscape': 'Landscape'
		},
		defaults: {
			'type': 'icons',
			'min-dpi': 160,
			'max-dpi': 480,
			'alloy': true,
			'label': false,
			'platforms': ['iphone', 'ipad', 'android'],
			'orientations': ['portrait', 'landscape'],
			'radius': 0,
			'no-crop': false,
			'no-fix': false,
			'no-nine': false
		}
	}
};
