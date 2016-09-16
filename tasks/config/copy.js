/**
 * `copy`
 *
 * ---------------------------------------------------------------
 *
 * Copy files and/or folders from your `assets/` directory into
 * the web root (`.tmp/public`) so they can be served via HTTP,
 * and also for further pre-processing by other Grunt tasks.
 *
 * #### Normal usage (`sails lift`)
 * Copies all directories and files (except CoffeeScript and LESS)
 * from the `assets/` folder into the web root -- conventionally a
 * hidden directory located `.tmp/public`.
 *
 * #### Via the `build` tasklist (`sails www`)
 * Copies all directories and files from the .tmp/public directory into a www directory.
 *
 * For usage docs see:
 *   https://github.com/gruntjs/grunt-contrib-copy
 *
 */
module.exports = function(grunt) {

  grunt.config.set('copy', {
    dev: {
      files: [
        {
          expand: true,
          cwd: './assets',
          src: ['**/*.!(coffee|less)'],
          dest: '.tmp/public',
          filter: 'isFile'
        },
        {
          expand: true,
          cwd: './assets',
          src: [
            'fonts/**',
            'images/**',
            'js/**',
            'styles/**/*.!less',
            // Exclude app configuration files since those are handled by
            // separate copy tasks.
            '!js/data/environments/**'
          ],
          dest: '.tmp/public/assets',
        }
      ]
    },
    devConfig: {
      files: [
        {
          expand: true,
          cwd: './assets',
          src: ['js/data/environments/development.js'],
          dest: '.tmp/public/assets/js/data/',
          rename: function(dest, src) {
            return dest + 'config.js'
          }
        }
      ]
    },
    prodConfig: {
      files: [
        {
          expand: true,
          cwd: './assets',
          src: ['js/data/environments/production.js'],
          dest: '.tmp/public/assets/js/data/',
          rename: function(dest, src) {
            return dest + 'config.js'
          }
        }
      ]
    },
    build: {
      files: [{
        expand: true,
        cwd: '.tmp/public',
        src: ['**/*'],
        dest: 'www'
      }]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
};
