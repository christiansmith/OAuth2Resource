module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-cov');

  grunt.initConfig({
    watch: {
      test: {
        files: [
          'index.js',
          'test/**/*.js'
        ],
        tasks: ['mochacov']
      }
    },
    mochacov: {
      options: {
        reporter: 'spec'
      },
      all: [
        'test/**/*.js'
      ]
    }
  });

  grunt.registerTask('test', ['mochacov', 'watch:test']);
  
};