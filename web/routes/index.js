var Arrow = require('arrow'),
  path = require('path'),
  uuid = require('node-uuid'),
  async = require('async'),
  child_process = require('child_process'),
  _ = require('lodash'),
  fs = require('fs-extra'),
  ticons = require('ticons'),
  pkg = require('../../package.json'),
  cliPkg = require('../../node_modules/ticons/package.json'),
  utils = require('../../lib/utils'),
  tiConstants = require('../../node_modules/ticons/lib/constants');

var Route = Arrow.Router.extend({
  name: 'index_post',
  path: '/',
  method: 'ALL',
  action: function(req, resp, next) {

    if (req.method !== 'POST') {
      return respond(req, resp);
    }

    var server = req.server;
    var CFG = server.config.app;

    // convert to bool
    req.params.alloy = !!req.params.alloy;
    req.params.label = !!req.params.label;
    req.params['storyboard'] = !!req.params['storyboard'];
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
    var doAssets = req.params.outputs.indexOf('assets') !== -1;

    if (!doIcons && !doSplashes && !doAssets) {
      return respond(req, resp, 'Select an output.');
    }

    if (doAssets && (doIcons || doSplashes)) {
      return respond(req, resp, 'You cannot combine assets with other types of output.');
    }

    var iconsOpts, splashesOpts, assetsOpts;

    resp.locals.examples = {};

    if (doIcons) {
      iconsOpts = select(req, resp, 'icons');
    }

    if (doSplashes) {
      splashesOpts = select(req, resp, 'splashes');
    }

    if (doAssets) {
      assetsOpts = select(req, resp, 'assets');
    }

    if (req.files.input.filename === '') {
      return respond(req, resp, 'Input is missing.');

    } else if (doAssets) {

      if (req.files.input.mimetype !== 'image/png' && req.files.input.mimetype !== 'image/jpeg') {
        return respond(req, resp, 'Input for assets must be a PNG or JPEG.');
      }

    } else {

      if (req.files.input.mimetype !== 'image/png') {
        return respond(req, resp, 'Input for icons and splashes must be a PNG.');
      }

    }

    var name = uuid.v1();
    var fileName = name + (CFG.useTar ? '.tar.gz' : '.zip');
    var tmpPath = path.join(CFG.tmpPath, name);
    var zipUrl = path.join(CFG.zipUrl, fileName);
    var zipPath = path.join(CFG.zipPath, fileName);

    async.series({

      icons: function(next) {

        if (!doIcons) {
          return next();
        }

        iconsOpts.outputDir = tmpPath;

        ticons.icons(iconsOpts, next);
      },

      splashes: function(next) {

        if (!doSplashes) {
          return next();
        }

        splashesOpts.outputDir = tmpPath;

        ticons.splashes(splashesOpts, next);
      },

      assets: function(next) {

        if (!doAssets) {
          return next();
        }

        assetsOpts.outputDir = tmpPath;

        ticons.assets(assetsOpts, next);
      },

      zip: function(next) {
        zip({
          input: tmpPath,
          output: zipPath,
          useTar: CFG.useTar
        }, next);
      }

    }, function(ticonsErr, results) {
      var errors = [];

      if (ticonsErr) {
        server.logger.error(ticonsErr);
        errors.push(ticonsErr.toString());
      }

      return fs.remove(tmpPath, function(removeErr) {

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

  opts.version = pkg.version;
  opts.cliVersion = cliPkg.version;
  opts.dpi = {};

  _.each(tiConstants.dpi, function(val, key) {

    if (['@1x', 'retinahd', 'retina', 'retina-hd'].indexOf(key) !== -1) {
      return;
    }

    if (opts.dpi[val]) {
      opts.dpi[val].push(key);
    } else {
      opts.dpi[val] = [key];
    }

  });

  opts.dpi = _.invert(_.mapValues(opts.dpi, function(val) {
    return val.join('/');
  }));

  opts.orientations = CFG.orientations;
  opts.outputs = CFG.outputs;
  opts.params = (req.method !== 'POST') ? CFG.defaults : req.params;
  opts.platforms = CFG.platforms;

  resp.render('index', opts);
}

function zip(opts, callback) {

  child_process.exec((opts.useTar ? 'tar -zcvf' : 'zip -r') + ' ' + opts.output + ' ./', {
    cwd: opts.input,

  }, function(error, stdout, stderr) {
    callback(error);
  });
}

function select(req, resp, output) {
  var CFG = req.server.config.app;

  var args = {
    'output-dir': 'path/to/your/project',
    'alloy': req.params.alloy,
    'platforms': req.params.platforms
  };

  var keys = ['sdk-version', 'alloy-base', 'min-dpi', 'max-dpi', 'label'];

  if (output === 'icons') {
    keys.push('radius');
  } else if (output === 'splashes') {
    keys.push('locale', 'orientation', 'width', 'height', 'storyboard', 'no-nine', 'no-crop', 'no-fix');
  } else {
    keys.push('orig-dpi');
  }

  keys.forEach(function(key) {
    if (req.params[key] !== CFG.defaults[key] && req.params[key] !== '') {
      args[key] = req.params[key];
    }
  });

  resp.locals.examples[output] = {};
  resp.locals.examples[output].cli = 'ticons ' + output + ' ' + (req.files.input.filename || 'path/to/your/image.png') + ' ' + utils.toArgs(args);
  var opts = utils.toCamelCase(args);
  opts.input = req.files.input.filename || 'path/to/your/image.png';
  resp.locals.examples[output].module = 'ticons.' + output + '(' + JSON.stringify(opts, null, '  ') + ', function(err, files) {});';
  opts.input = req.params.input;

  return opts;
}

module.exports = Route;
