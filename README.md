# TiCons Server

This Appcelerator Arrow Cloud (NodeJS) server running at [http://ticons.fokkezb.nl](http://ticons.fokkezb.nl) wraps the [TiCons CLI](https://www.npmjs.com/package/ticons).

## Prerequisites

* [ImageMagick](http://www.imagemagick.org/script/binary-releases.php)

  On Arrow Cloud, ImageMagick is available by default.

## Running it local

Before you can run this local add a `secret.js` file to the `conf` directory which has unique strings for the missing values in `default.js`. Then use `appc run` to start the local server.

## Issues

Please report issues and features requests in the repo's [issue tracker](https://github.com/fokkezb/ticons-server/issues).

## License

Distributed under [MIT License](LICENSE).
