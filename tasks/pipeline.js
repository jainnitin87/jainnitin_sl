/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files, and ! in front of an expression to ignore files.)
 *
 * For more information see:
 *   https://github.com/balderdashy/sails-docs/blob/master/anatomy/myApp/tasks/pipeline.js.md
 */

// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssFilesToInject = [
  'vendors/**/*.css',
  'assets/**/*.css'
];

// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [
  // Load all of the front-end vendor packages.
  'vendors/jquery/**/*.js',
  'vendors/lodash/**/*.js',
  'vendors/backbone/**/*.js',
  'vendors/handlebars/**/*.js',
  'vendors/**/*.js',

  // Next, load the precompiled handlebars templates. This assumes that both
  // the `handlebars:dev` and `copy:dev` tasks have already completed. We need
  // to bundle this file along with the script files so the app can be properly
  // minified for production.
  'assets/js/templates.js',

  // Finally, load all components of the application.
  // Logger and application utilities
  'assets/js/utils/AppConstants.js',
  'assets/js/utils/AppUtil.js',
  'assets/js/utils/AppLogger.js',
  // Base application and configuration
  'assets/js/app.js',
  'assets/js/data/config.js',
  // Application base classes
  'assets/js/views/pages/BaseView.js',
  'assets/js/views/basecomponents/**/*.js',
  'assets/js/models/basecomponents/*.js',
  'assets/js/collections/basecomponents/*.js',
  // Application managers
  'assets/js/managers/**/*.js',
  // Application core
  'assets/js/utils/*.js',
  'assets/js/plugins/**/*js',
  'assets/js/models/**/*.js',
  'assets/js/collections/**/*.js',
  'assets/js/views/**/*.js',
  'assets/js/routers/**/*.js',
  'assets/js/main.js'
];


// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(function(cssPath) {
  // If we're ignoring the file, make sure the ! is at the beginning of the path
  if (cssPath[0] === '!') {
    return require('path').join('!.tmp/public/', cssPath.substr(1));
  }
  return require('path').join('.tmp/public/', cssPath);
});
module.exports.jsFilesToInject = jsFilesToInject.map(function(jsPath) {
  // If we're ignoring the file, make sure the ! is at the beginning of the path
  if (jsPath[0] === '!') {
    return require('path').join('!.tmp/public/', jsPath.substr(1));
  }
  return require('path').join('.tmp/public/', jsPath);
});

