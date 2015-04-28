var Arrow = require('arrow'),
	tiConstants = require('../../node_modules/ticons/lib/constants');

var Route = Arrow.Router.extend({
	name: 'index',
	path: '/',
	method: 'GET',
	action: function (req, resp) {
		var CFG = req.server.config.app;

		resp.render('index', {
			dpi: tiConstants.dpi,
			platforms: CFG.platforms,
			orientations: CFG.orientations,
			params: CFG.defaults
		});
	}
});

module.exports = Route;
