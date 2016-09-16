//
// Precompiles Handlebars templates to a single `.js` file.
//
// This basically takes HTML template files and turns them into tiny little
// javascript functions that you pass data to and they'll return HTML. This can
// speed up template rendering on the client, and reduce bandwidth usage.

module.exports = function(grunt) {
  grunt.config.set('handlebars', {
    dev: {
      options: {
        namespace: 'App.Templates',
        processName: _formatName,
        partialRegex: /.*/,
        partialsPathRegex: /\/basecomponents\/partials\//,
        processPartialName: _formatPartialName
      },
      files: {
        '.tmp/public/assets/js/templates.js': './assets/templates/**/*.hbs'
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-handlebars')
}

////////////
// Private

/**
 * Format handlebars template name.
 */
function _formatName(filename) {
  filename = stripExt(filename)
  filename = stripPrefix(filename)

  return filename
}

/**
 * Format handlebars partial name.
 */
function _formatPartialName(filename) {
  // Use only the partial basename and trim any trailing extentions.
  var pieces = filename.split('/')
  var basename = pieces[pieces.length - 1]

  return stripExt(basename)
}

// Util
//------
function stripExt(str) {return str.replace(/\.[^/.]+$/, '')}
function stripPrefix(str) {return str.replace(/^.*assets\/templates\//, '')}
