# gulp-dashboard [![Build Status](https://travis-ci.org/larsonjj/gulp-dashboard.svg?branch=master)](https://travis-ci.org/larsonjj/gulp-dashboard) [![NPM version](https://badge.fury.io/js/gulp-dashboard.svg)](http://badge.fury.io/js/gulp-dashboard)

> Generates a static dashboard based on data parsed within specified files.


## Install

```
$ npm install --save-dev gulp-dashboard
```

### Usage Examples

#### Default Options
In this example, the default options are used to parse JSON data from within a `*.dash.json`. So when the task below runs, it will create a `index.html` file within the `dashboard` directory built from all the scanned JSON files within the `index` directory.

`index/index.dash.json`:
```json
{
    "status": "development",
    "category": "page",
    "label": "Home",
    "link": "path/to/file/index.html"
}
```

`gulpfile.js`
```js
var gulp = require('gulp');
var dashboard = require('gulp-dashboard');

gulp.task('default', function () {
  return gulp.src('index/*.dash.json')
    .pipe(dashboard())
    .pipe(gulp.dest('dist'));
});
```

#### Custom Compiler Options
In this example, you can see that the `options.compiler` property is used to control which compiler to use for rendering module templates.
So when the task below runs, it will create a `index.html` file within the `dashboard` directory built from all the scanned Jade files within the `index` directory.
Notice the `index/index.dash.jade` example: This will build out an HTML partial file using the markup within that file using the jade compiler.
It's compiled source will then be rendered out to the handlebars template specified with `options.moduleTemplate`.

`index/index.dash.json`:
```json
{
    "status": "development",
    "category": "page",
    "label": "Home",
    "link": "path/to/file/index.html"
}
```

`index/index.dash.jade`
```jade
div
  h1 Testing
    p
      This is just a simple test
```

`gulpfile.js`
```js
var gulp = require('gulp');
var dashboard = require('gulp-dashboard');

gulp.task('default', function () {
  return gulp.src('index/*.dash.{json,jade}')
    .pipe(dashboard({
      compiler: require('jade'),
      compilerOptions: {pretty: true, filename: true},
      dashTemplate: 'dashboard/dashboard-template.hbs',
      moduleTemplate: 'dashboard/module-template.hbs'
    }))
    .pipe(gulp.dest('dist'));
});
```


## API

### Options

#### options.compiler
Type: `Object`
Default value: `undefined`

Compiler you would like to use for rendering templates. The compiler you use must have a `render` method in order to work (ex. Jade, Swig, etc)

> NOTE: You will need to install your desired template compiler and require it as the value of the compile key

Example:
```js
options: {
  compiler: require('jade')
}
```

#### options.compilerOptions
Type: `Object`
Default value: `{}`

Compiler options you would like to pass into your desired compiler.

Example:
```js
options: {
  compiler: require('jade'),
  compilerOptions: {pretty: true, filename: true}
}
```

#### options.generatedDir
Type: `String`
Default value: `dashboard/generated`

A string value that is used to determine where the dashboard html file will be generated.

#### options.dashTemplate
Type: `String`
Default value: `node_modules/gulp-dashboard/dashboard/dashboard-template.hbs`

A string value that is used to determine what handlebars template should be used for generating the dashboard.

#### options.name
Type: `String`
Default value: `dashboard`

A string value that is used to determine what the filename will be for the generated dashboard HTML.

#### options.moduleTemplate
Type: `String`
Default value: `node_modules/gulp-dashboard/dashboard/module-template.hbs`

A string value that is used to determine what handlebars template should be used for generating components and other HTML partials.

#### options.logo
Type: `String`
Default value: `''`

A string value that is used to determine what image should be used in a template as a logo.

#### options.data
Type: `Object`
Default value: `{}`

An object of custom variables that will be passed to the Handlebars template. Useful if you want to pass things like version information or other custom variables from your Gulp build process.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Gulp](http://gulpjs.com/).

## Release History

<strong>v1.0.2</strong> - Added `options.name` to allow user to change the filename output

<strong>v1.0.1</strong> - Fixed output pathing errors

<strong>v1.0.0</strong> - Initial release

## License

MIT © [Jake Larson](https://github.com/larsonjj)
