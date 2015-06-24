'use strict';
var path = require('path');
var assert = require('assert');
var gutil = require('gulp-util');
var dashboard = require('./');

it('should ', function (cb) {
  var stream = dashboard();

  stream.on('data', function (file) {
    assert.strictEqual(file.contents.toString(), 'unicorns');
  });

  stream.on('end', cb);

  stream.write(new gutil.File({
    base: __dirname,
    path: path.join(__dirname, '/file.ext'),
    contents: new Buffer('unicorns')
  }));

  stream.end();
});
