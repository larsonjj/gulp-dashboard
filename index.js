'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var handlebars = require('handlebars');
var path = require('path');
var _ = require('underscore');
_.str = require('underscore.string');
_.mixin(_.str.exports());

module.exports = function (options) {
  // Merge task-specific and/or target-specific options with these defaults.
  var _options = options || {
    // Allows author to use custom compiler
    // NOTE: needs to have a compile() method or it won't work
    // Known supported compilers:
    // Jade, Swig
    compiler: undefined,
    compilerOptions: {},
    generatedDir: 'dashboard/generated',
    dashTemplate: 'node_modules/grunt-dashboard/dashboard/dashboard-template.hbs',
    moduleTemplate: 'node_modules/grunt-dashboard/dashboard/module-template.hbs',
    logo: '',
    data: {},
    includes: [{
      cwd: 'node_modules/grunt-dashboard/dashboard/assets/',
      src: [
        '**/*'
      ]
    }]
  };

  // if (!_options.foo) {
  //   throw new gutil.PluginError('gulp-dashboard', '`foo` required');
  // }

  var handlebarsOptions = {};

  var compileToFile = function(item) {

    grunt.log.debug(item.source);

    try {
      item.source = options.compiler.render(item.source, options.compilerOptions);
    }
    catch (e) {
      grunt.log.error('Data inside "' + item.name + '" will not compile');
      grunt.log.error('------- Details Below -------');
      grunt.log.errorlns(e);
    }

    // Add data to template
    item.data = options.data;

    // Grab handlebars template for modules
    var templateFile = grunt.file.read(options.moduleTemplate);

    // Compile out HTML from template
    var template = handlebars.compile(templateFile);

    //Pass data to template
    var html = template(item);

    grunt.file.write('./' + options.generatedDir + '/' + item.name + '.html', html);
    grunt.log.writeln('HTML file created at:  "' + options.generatedDir + '/' + item.name + '.html"');
  };

  var getExtension = function(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i);
  };

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('gulp-dashboard', 'Streaming not supported'));
      return;
    }

    try {
      file.contents = new Buffer(file.contents.toString());
      this.push(file);
    }
    catch (err) {
      this.emit('error', new gutil.PluginError('gulp-dashboard', err));
    }

    cb();
  });
};
