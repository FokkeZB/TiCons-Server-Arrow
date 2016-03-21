var path = require('path');
var os = require('os');

module.exports = {
	app: {
		tmpPath: os.tmpdir(),
		zipUrl: '/download',
		zipPath: path.join(__dirname, '..', 'web', 'public', 'download'),
		useTar: false,
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
			'splashes': 'Splashes',
			'assets': 'Assets'
		},
		defaults: {
			'outputs': ['icons', 'splashes'],
			'min-dpi': 160,
			'max-dpi': 640,
			'alloy': true,
			'label': false,
			'sdk-version': '5.2.0',
			'platforms': ['iphone', 'ipad', 'android'],
			'orientations': ['portrait', 'landscape'],
			'radius': 0,
			'no-crop': false,
			'no-fix': false,
			'no-nine': false,
			'storyboard': false,
			'alloy-base': 'app'
		}
	}
};
