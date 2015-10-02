var Arrow = require('arrow'),
	pkg = require('../../package.json'),
	cliPkg = require('../../node_modules/ticons/package.json')
	tiConstants = require('../../node_modules/ticons/lib/constants');

var Route = Arrow.Router.extend({
	name: 'index',
	path: '/',
	method: 'GET',
	action: function (req, resp) {
		var CFG = req.server.config.app;

		resp.render('index', {
			version: pkg.version,
			cliVersion: cliPkg.version,
			dpi: tiConstants.dpi,
			orientations: CFG.orientations,
			outputs: CFG.outputs,
			params: CFG.defaults,
			platforms: CFG.platforms
		});
	}
});

module.exports = Route;
