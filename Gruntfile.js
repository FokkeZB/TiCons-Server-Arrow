var child_process = require('child_process'),
	async = require('async');

var REGEXP_VERSIONS = /versions: ((?:(?:, )?[0-9]+\.[0-9]+\.[0-9]+)+)\..+currently: ([0-9]+\.[0-9]+\.[0-9]+)/;

module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		mochaTest: {
			options: {
				timeout: 30000,
				reporter: 'spec',
				ignoreLeaks: false
			},
			src: ['test/**/*.js']
		},
		jshint: {
			options: {
				jshintrc: true
			},
			src: ['*.js', 'lib/**/*.js', 'apis/**/*.js', 'connectors/**/*.js', 'models/**/*.js', 'blocks/**/*.js', 'test/**/*.js']
		},
		kahvesi: {
			src: ['test/**/*.js']
		},
		clean: ['tmp'],
		semver: {
			pkg: {
				src: 'package.json',
				dest: 'package.json'
			}
		},
		exec: {
			publish: {
				command: 'appc publish'
			}
		},
	});

	grunt.registerTask('unpublish', 'Unpublished old versions', function () {
		var done = this.async();

		child_process.exec('appc acs publish --list_versions', function (error, stdout, stderr) {

			if (error !== null) {
				return grunt.fail.fatal(error);
			}

			var matches = stdout.match(REGEXP_VERSIONS);

			if (matches === null) {
				return done();
			}

			var all = matches[1].split(', ');
			var deployed = matches[2];

			if (all.length === 1) {
				return done();
			}

			async.each(all, function (version, callback) {

				if (version === deployed) {
					return callback();
				}

				grunt.log.writeln('Unpublishing: ' + version);
				child_process.exec('appc acs unpublish --ver ' + version, callback);

			}, done);
		});

	});

	// Load grunt plugins for modules
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-kahvesi');
	grunt.loadNpmTasks('grunt-semver');
	grunt.loadNpmTasks('grunt-exec');

	// register tasks
	grunt.registerTask('cover', ['kahvesi', 'clean']);
	grunt.registerTask('publish', ['semver:pkg:bump:patch', 'unpublish', 'exec:publish']);
	grunt.registerTask('test', ['jshint', 'mochaTest', 'clean']);

	grunt.registerTask('default', ['publish']);
};
