module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    html2js: {
      options: {
        base: 'src/templates/',
        module: 'TeknovisioDemoTpls',
        singleModule: true,
        useStrict: true,
        htmlmin: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeComments: true
        }
      },
      release: {
        src: 'src/templates/*.html',
        dest: 'dist/app.tpls.min.js'
      },
      debug: {
        src: 'src/templates/*.html',
        dest: 'dist/app.tpls.js'
      }
    },
    concat: {
      options: {
        sourceMap: true,
        banner: '(function(){"use strict";\n',
        process: function(src, filepath) {
          return '//region ' + filepath + '\n' + src + '\n//endregion';
        },
        footer: '\n})();',
        expand: true
      },
      debug: {
        files: {
          'dist/app.js': [
            'src/**/app.js',
            'src/**/*.directive.js',
            'src/**/*.service.js',
            'src/**/*.model.js',
            'src/**/*.controller.js',
            '!src/libs/**/*',
            '!src/external/**/*'
          ]
        }
      }
    },

    uglify: {
      options: {
        sourceMap: true,
        banner: '(function(){"use strict";\n',
        process: function(src, filepath) {
          return '//region ' + filepath + '\n' + src + '\n//endregion';
        },
        footer: '\n})();',
        expand: true,
        mangle: false
      },
      release: {
        files: {
          'dist/app.min.js': [
            'src/**/app.js',
            'src/**/*.directive.js',
            'src/**/*.service.js',
            'src/**/*.model.js',
            'src/**/*.controller.js',
            '!src/libs/**/*',
            '!src/external/**/*'
          ]
        }
      }
    },
    copy: {
      html: {
        expand: true,
        cwd: 'src/',
        src: ['**/*.html', '!templates/**/*.html', '**/*.css', '!templates/**/*.css', '!libs/**/*'],
        dest: 'dist/'
      },
      bower: {
        expand: true,
        flatten: true,
        src: [
          'bower_components/**/*.min.js',
          'bower_components/**/bubblechart.js',
          'bower_components/**/*.min.css',
          'bower_components/**/crypto-js.js',
          'bower_components/**/hmac-sha1.js',
          'src/external/**/*'
        ],
        dest: 'dist/external/'
      },
      assets: {
        expand: true,
        cwd: 'bower_components/bootstrap/dist',
        src: ['**/fonts/*'],
        dest: 'dist/'
      }
    },
    clean: {
      dist: {
        src: 'tmp/'
      },
      tmp: {
        src: 'tmp/'
      }
    },
    watch: {
      all: {
        files: ['src/**/*.js', 'src/**/*.html', 'src/**/*.css', 'bower_components/BubbleChart/dist/*.min.js', 'Gruntfile.js'],
        tasks: ['full']
      }

    }
  });


  grunt.registerTask('debug', ['clean:dist', 'html2js:debug', 'concat:debug', 'copy:html', 'copy:bower', 'clean:tmp']);
  grunt.registerTask('release', ['clean:dist', 'html2js:release', 'uglify:release', 'copy:html', 'copy:bower', 'copy:assets', 'clean:tmp']);
  grunt.registerTask('full', ['clean:dist', 'html2js:debug', 'html2js:release', 'concat:debug', 'uglify:release', 'copy:html', 'copy:bower', 'copy:assets', 'clean:tmp']);

  grunt.registerTask('default', ['full', 'watch']);

};