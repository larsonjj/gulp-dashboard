'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var handlebars = require('handlebars');
var path = require('path');
var fs = require('fs');
var defaultJade = require('jade');
var _ = require('lodash');
_.str = require('underscore.string');
_.mixin(_.str.exports());

// Cache all file statuses and categories
var cache = {
  statuses: [],
  categories: []
};

module.exports = function (options) {
  // Merge task-specific and/or target-specific options with these defaults.
  var _options = _.extend({
    // Allows author to use custom compiler
    // NOTE: needs to have a compile() method or it won't work
    // Known supported compilers:
    // Jade, Nunjucks
    compiler: undefined,
    compilerOptions: {},
    generatedDir: 'dashboard/generated',
    dashTemplate: 'node_modules/grunt-dashboard/dashboard/dashboard-template.hbs',
    moduleTemplate: 'node_modules/grunt-dashboard/dashboard/module-template.hbs',
    logo: '',
    data: {},
    name: 'dashboard'
  }, options || {});
  var compiler = _options.compiler || defaultJade;

  // Data to pass to dashboard handlebars template
  var handlebarsOptions = {
    categories: [],
    statuses: [],
    generated: [],
    data: _options.data || {}, // Setup custom data to pass to dashboard templates
    logo: _options.logo || '' // Setup custom logo to pass to main dashboard template
  };

  // Create if value helper for Handlebars templates
  handlebars.registerHelper('ifvalue', function (conditional, config) {
    if (config.hash.value === conditional) {
      return config.fn(this);
    }
    else {
      return config.inverse(this);
    }
  });

  // Read file contents based on filepath
  var getFile = function getFile(filepath) {
    return fs.readFileSync(filepath).toString();
  };

  var renderToString = function(item) {

    try {
      // If using nunjucks or any compiler with renderString method
      if (compiler.renderString) {
        compiler.configure('./', {
          autoescape: true,
          watch: false
        });
        item.source = compiler.renderString(item.source, _options.compilerOptions);
      }
      // If using jade or any other compiler with render method
      else {
        _options.compilerOptions.filename = item.name;
        item.source = compiler.render(item.source, _options.compilerOptions);
      }
    }
    catch (e) {
      new gutil.PluginError('gulp-dashboard', 'Data inside "' + item.name + '" will not compile');
      new gutil.PluginError('gulp-dashboard', '------- Details Below -------');
      new gutil.PluginError('gulp-dashboard', e);
    }


    // Add data to template
    item.data = _options.data;

    // Grab handlebars template for modules
    var templateFile = getFile(_options.moduleTemplate);

    // Compile out HTML from template
    var template = handlebars.compile(templateFile);

    // Pass data to template and render to HTML string
    return template(item);
  };

  var getExtension = function(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i);
  };

  // Remove duplicate filters on dashboard
  var dedupeFilters = function dedupeFilters() {

    cache.categories = _.uniq(cache.categories, 'class');

    cache.statuses = _.uniq(cache.statuses, 'class');

  };

  var createDashboard = function createDashboard() {
    // Read the dashboard handlebars template
    var templateFile = getFile(_options.dashTemplate);

    // Compile template source
    var template = handlebars.compile(templateFile);

    dedupeFilters();

    // Include cache
    handlebarsOptions.categories = cache.categories;
    handlebarsOptions.statuses = cache.statuses;

    // Create HTML from template, data, and config
    return template(handlebarsOptions);

  };

  var parseSource = function parseSource(file) {
    var data = {};
    var filePath = file.path.toString();
    var fileExt = getExtension(file.path.toString());
    var src = file.contents.toString();

    if (fileExt === '.json') {
      // Test to make sure data is JSON can be parsed
      try {
        data = JSON.parse(src);
      }
      catch (e) {
        new gutil.PluginError('gulp-dashboard', 'Data inside "' + file.src + '" is not in correct JSON format');
        new gutil.PluginError('gulp-dashboard', '------- Details Below -------');
        new gutil.PluginError('gulp-dashboard', e);
      }

      // Set a default label if none is found
      if (!data.label) {
        data.label = path.basename(filePath, '.html');
      }

      // Set a default link if none is found
      if (!data.link) {
        data.link = '/' + filePath.replace('dash.json', 'html');
      }

      // Set a default status if none is found
      if (!data.status) {
        data.status = 'unknown';
      }

      // Set a default category if none is found
      if (!data.category) {
        data.category = 'unknown';
      }

      cache.categories.push({
        class: data.category,
        name: _.titleize(data.category)
      });
      cache.statuses.push({
        class: data.status,
        name: _.titleize(data.status)
      });
      handlebarsOptions.generated.push(data);

      return {
        source: createDashboard(),
        type: 'page'
      };
    }
    else if (_options.compiler) {
      // Compile file
      return {
        source: renderToString({
          source: src,
          name: path.basename(filePath, '.dash' + fileExt)
        }),
        type: 'module'
      };
    }
    else {
      new gutil.PluginError('gulp-dashboard', 'No Compiler Defined! Aborting.');
    }
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

    // Parse source files and handle JSON/Template cases
    var renderObj = parseSource(file);
    var newFile = {};

    try {
      if (renderObj.type === 'page') {
        newFile = new gutil.File({
          base: './',
          cwd: __dirname,
          path: _options.name + '.html'
        });
      }
      else {
        newFile = new gutil.File({
          base: './',
          cwd: __dirname,
          path: gutil.replaceExtension(path.basename(file.path).replace('.dash', ''), '.html')
        });
      }
      newFile.contents = new Buffer(renderObj.source);
      this.push(newFile);
    }
    catch (err) {
      this.emit('error', new gutil.PluginError('gulp-dashboard', err));
    }

    if (newFile && !_.isEmpty(newFile)) {
      cb(null, newFile);
    }
    else {
      cb(null, file);
    }

  });
};
