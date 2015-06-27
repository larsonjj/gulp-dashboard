var fs = require('fs');
var path = require('path');
var should = require('should');
var gutil = require('gulp-util');
// var assert = require('stream-assert');
var gulp = require('gulp');
var dashboard = require('../');
var jade = require('jade');
var nunjucks = require('nunjucks');


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
        dashTemplate: './dashboard/dashboard-template.hbs'
      }))
      .pipe(gulp.dest('tmp'))
      .on('end', function() {
        var expected = getFile('../tmp/dashboard.html');
        should.exist(expected);
        done();
      });
  });

  it('should handle multiple JSON files to render module templates with Jade', function(done) {
    gulp.src(fixtures('module/*.dash.{json,jade}'))
      .pipe(dashboard({
        dashTemplate: './dashboard/dashboard-template.hbs',
        moduleTemplate: './dashboard/module-template.hbs',
        compiler: jade
      }))
      .pipe(gulp.dest('tmp'))
      .on('end', function() {
        var expected = getFile('../tmp/module.html');
        should.exist(expected);
        done();
      });
  });

  it('should handle multiple JSON files to render both Page and Module templates with Jade', function(done) {
    gulp.src(fixtures('[**/*.json, **/*.dash.jade]'))
      .pipe(dashboard({
        dashTemplate: './dashboard/dashboard-template.hbs',
        moduleTemplate: './dashboard/module-template.hbs',
        compiler: jade
      }))
      .pipe(gulp.dest('tmp'))
      .on('end', function() {
        var expected = getFile('../tmp/module.html');
        var expectedTwo = getFile('../tmp/dashboard.html');
        should.exist(expected);
        should.exist(expectedTwo);
        done();
      });
  });

  it('should handle multiple JSON files to render module templates with Nunjucks', function(done) {
    gulp.src(fixtures('module/*.dash.{json,nunjucks}'))
      .pipe(dashboard({
        dashTemplate: './dashboard/dashboard-template.hbs',
        moduleTemplate: './dashboard/module-template.hbs',
        compiler: nunjucks
      }))
      .pipe(gulp.dest('tmp'))
      .on('end', function() {
        var expected = getFile('../tmp/module.html');
        should.exist(expected);
        done();
      });
  });

  it('should handle multiple JSON files to render both Page and Module templates with Nunjucks', function(done) {
    gulp.src(fixtures('[**/*.json, **/*.dash.nunjucks]'))
      .pipe(dashboard({
        dashTemplate: './dashboard/dashboard-template.hbs',
        moduleTemplate: './dashboard/module-template.hbs',
        compiler: nunjucks
      }))
      .pipe(gulp.dest('tmp'))
      .on('end', function() {
        var expected = getFile('../tmp/module.html');
        var expectedTwo = getFile('../tmp/dashboard.html');
        should.exist(expected);
        should.exist(expectedTwo);
        done();
      });
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
