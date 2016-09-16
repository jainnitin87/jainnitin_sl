
/**
 * Build bower libraries.
 *
 * This task will build all bower dependencies and copy them into
 * the ./tmp/public/lib directory.
 */

module.exports = function(grunt) {

  grunt.config.set('bower', {
    dev: {
      dest: '.tmp/public/vendors',
      options: {
        expand: true,
        packageSpecific: {
          'Less-Boilerplate': {
            files: ['boilerplate.less'],
          }
        }

      }
    }
  })

  grunt.loadNpmTasks('grunt-bower')
}
