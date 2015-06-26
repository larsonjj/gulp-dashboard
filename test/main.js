var fs = require('fs');
var path = require('path');
var should = require('should');
var gutil = require('gulp-util');
var assert = require('stream-assert');
var gulp = require('gulp');
var dashboard = require('../');

var getFile = function getFile(filepath) {
  return new gutil.File({
    base: 'test/fixtures',
    cwd: 'test',
    path: filepath,
    contents: fs.readFileSync('test/' + filepath)
  });
};

var getExpected = function getExpected(filepath) {
  return fs.readFileSync('test/expected/' + filepath, 'utf8');
};

var fixtures = function (glob) {
  return path.join(__dirname, 'fixtures', glob);
};

describe('gulp-dashboard', function() {

  it('should handle a single JSON file render dashboard html', function(done) {
    var stream = dashboard({
      dashTemplate: './dashboard/dashboard-template.hbs',
      moduleTemplate: './dashboard/module-template.hbs'
    });
    var input = getFile('fixtures/default.json');
    var expected = getExpected('default.html');

    stream.once('data', function(output) {
      should.exist(output);
      should.exist(output.contents);
      path.extname(output.path).should.equal('.html');
      output.contents.toString().should.equal(expected);
      done();
    });

    stream.write(input);
    stream.end();
  });

  it('should handle multiple JSON files to render dashboard html file', function(done) {
    gulp.src(fixtures('*.json'))
      .pipe(dashboard({
        dashTemplate: './dashboard/dashboard-template.hbs',
        moduleTemplate: './dashboard/module-template.hbs'
      }))
      .pipe(gulp.dest('tmp'));
    done();
  });

  it('should emit error on streamed file', function(done) {
    gulp.src(fixtures('*.json'), { buffer: false })
      .pipe(dashboard({
        dashTemplate: './dashboard/dashboard-template.hbs',
        moduleTemplate: './dashboard/module-template.hbs'
      }))
      .on('error', function (err) {
        err.message.should.eql('Streaming not supported');
        done();
      });
  });

});
