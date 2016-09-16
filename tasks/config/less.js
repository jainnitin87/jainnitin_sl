/**
 * `less`
 *
 * ---------------------------------------------------------------
 *
 * Compile your LESS files into a CSS stylesheet.
 *
 * By default, only the `assets/styles/importer.less` is compiled.
 * This allows you to control the ordering yourself, i.e. import your
 * dependencies, mixins, variables, resets, etc. before other stylesheets)
 *
 * For usage docs see:
 *   https://github.com/gruntjs/grunt-contrib-less
 *
 */
module.exports = function(grunt) {

  grunt.config.set('less', {
    dev: {
      options: {paths: ['.tmp/public/vendors']},
      files: [{
        expand: true,
        cwd: 'assets/styles/less',
        src: ['importer.less'],
        dest: '.tmp/public/assets/styles/',
        ext: '.css'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
};
