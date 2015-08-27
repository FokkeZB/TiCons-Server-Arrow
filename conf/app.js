var path = require('path');

module.exports = {
	app: {
		tmpPath: path.join(__dirname, '..', 'tmp'),
		zipUrl: '/download',
		zipPath: path.join(__dirname, '..', 'web', 'public', 'download'),
		purgeInterval: 1000 * 60 * 5,
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
		outputs: {
			'icons': 'Icons',
			'splashes': 'Splashes'
		},
		defaults: {
			'outputs': ['icons', 'splashes'],
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
