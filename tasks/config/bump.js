//
// Copyright (c) 2014 Nutanix Inc. All rights reserved.
//
// Bumps the application version
//
// For usage docs see: https://github.com/vojtajina/grunt-bump
//

module.exports = function(grunt) {
  var configFiles = [
    'package.json',
    'assets/js/data/environments/production.js',
    'assets/js/data/environments/development.js'
  ]

  grunt.config.set('bump', {
    options: {
      files: configFiles,
      commit: true,
      commitMessage: 'Bump version to v%VERSION%',
      commitFiles: configFiles,
      push: false,
      createTag: false,
    }
  })

  grunt.loadNpmTasks('grunt-bump');
}
