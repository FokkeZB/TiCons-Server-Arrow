var Arrow = require('arrow'),
	server = new Arrow(),
	handlebars = server.getMiddleware().getRendererEngine('hbs'),
	utils = require('./lib/utils'),
	_ = require('lodash');

handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
	switch (operator) {
		case '===':
			return (v1 === v2) ? options.fn(this) : options.inverse(this);
		case '==':
			return (v1 == v2) ? options.fn(this) : options.inverse(this);
		case '!==':
			return (v1 !== v2) ? options.fn(this) : options.inverse(this);
		case '&&':
			return (v1 && v2) ? options.fn(this) : options.inverse(this);
		case '||':
			return (v1 || v2) ? options.fn(this) : options.inverse(this);
		case '<':
			return (v1 < v2) ? options.fn(this) : options.inverse(this);
		case '<=':
			return (v1 <= v2) ? options.fn(this) : options.inverse(this);
		case '>':
			return (v1 > v2) ? options.fn(this) : options.inverse(this);
		case '>=':
			return (v1 >= v2) ? options.fn(this) : options.inverse(this);
		case 'in':
			return (_.isArray(v2) && v2.indexOf(v1) !== -1) ? options.fn(this) : options.inverse(this);
	}
});

// lifecycle examples
server.on('starting', function () {
	server.logger.debug('server is starting!');

	// purge zip files every 15m
	setInterval(function () {
		utils.purge(server);
	}, server.config.app.purgeInterval);

});

server.on('started', function () {
	server.logger.debug('server started!');
});

// start the server
server.start();
