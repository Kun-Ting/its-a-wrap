/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),    
    // Task configuration.
    ts: {
      commonjs: {
        tsconfig: true,
        options: {
          inlineSourceMap: true
        }
      },
      test: {
        src: ['test/*.ts', '!index.ts', '!src/batch.ts'],
        options: {
          failOnTypeErrors: false,
          target: 'es5',
          sourceMap: true
        }
      }
    },
    browserify: {
      dist: {
        options: {
          browserifyOptions: {
            // plugin: [
            //   [
            //     'tsify', { target: 'es6' },
            //   ]
            // ],
            standalone: 'pairwisegradientdescent',
            debug: true
          },
          // transform: [["babelify", { "presets": ["es2015"] }]]
        },
        files: {
          'index.js': ['dist/index.js']
        }
      },
      examples: {
        options: {
          browserifyOptions: {
            plugin: [
              [
                'tsify', { 
                  target: 'es6',
                  allowJs: true 
                },
              ]
            ],
            debug: true
          },
          transform: [["babelify", { "presets": ["es2015"] }]]
        },
        files: {
          'src/notoruslayout.js': ['src/notoruslayout.ts'],
          'src/toruslayout.js': ['src/toruslayout.ts'],
          'src/layouthelper.js': ['src/layouthelper.ts'],
          'view/torusview.js': ['view/torusview.ts'],
          'view/baseview.js': ['view/baseview.ts'],          
          'index.js': ['index.ts']
        }
      }
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['src/*.ts'],
        dest: 'dist/index.js'
      }
    },
    uglify: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'index.min.js': [
            'index.js'
          ]
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {}
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    },
    umd: {
      all: {
        src: '<%= dist.dest %>',
        template: 'templates/umd.hbs',
        objectToExport: 'index',
        deps: {
          'default': ['d3']
        }
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      }
    }
  });

  // These plugins provide necessary tasks.

  // Default task.
  // grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
  // grunt.registerTask('default', ['ts', 'browserify', 'uglify']);
  grunt.registerTask('default', ['ts', 'browserify']);
};
