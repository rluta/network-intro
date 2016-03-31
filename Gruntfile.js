/* global module:false */
module.exports = function(grunt) {
	var port = grunt.option('port') || 8000;
	var base = grunt.option('base') || '.';

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		qunit: {
			files: [ 'test/*.html' ]
		},
		uglify: {
			build: {
				src: 'js/reveal.js',
				dest: 'js/reveal.min.js'
			}
		},

		sass: {
			core: {
				files: {
					'css/reveal.css': 'css/reveal.scss',
				}
			},
			themes: {
				files: [
					{
						expand: true,
						cwd: 'css/theme/source',
						src: ['*.scss'],
						dest: 'css/theme',
						ext: '.css'
					}
				]
			}
		},

		autoprefixer: {
			dist: {
				src: 'css/reveal.css'
			}
		},

		cssmin: {
			compress: {
				files: {
					'css/reveal.min.css': [ 'css/reveal.css' ]
				}
			}
		},

		jshint: {
			options: {
				curly: false,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				eqnull: true,
				browser: true,
				expr: true,
				globals: {
					head: false,
					module: false,
					console: false,
					unescape: false,
					define: false,
					exports: false
				}
			},
			files: [ 'Gruntfile.js', 'js/reveal.js' ]
		},

		connect: {
			server: {
				options: {
					port: port,
					base: base,
					livereload: true,
					open: true
				}
			}
		},

		zip: {
			'network-introduction-presentation.zip': [
				'index.html',
				'css/**',
				'data/**',
				'fonts/**',
				'js/**',
				'lib/**',
				'images/**',
				'plugin/**',
				'**.md',
				'slides/**'
			]
		},

		watch: {
			options: {
				livereload: true
			},
			js: {
				files: [ 'Gruntfile.js', 'js/reveal.js' ],
				tasks: 'js'
			},
			theme: {
				files: [ 'css/theme/source/*.scss', 'css/theme/template/*.scss' ],
				tasks: 'css-themes'
			},
			css: {
				files: [ 'css/reveal.scss' ],
				tasks: 'css-core'
			},
			html: {
				files: [ 'index.html']
			},
			markdown: {
				files: [ './*.md' ]
			}
		},
		copy: {
			dist: {
				files: [
					{
						expand: true,
						src: [
							'index.html',
							'css/**',
							'data/**',
							'fonts/**',
							'js/**',
							'lib/**',
							'images/**',
							'plugin/**',
							'**.md',
							'slides/**'
						],
						dest: 'dist/'
					}
				]
			}
		},
		buildcontrol: {
			options: {
				dir: 'dist'
			},
			commit: true,
			push: true,
			message: 'Built from %sourceCommit% on branch %sourceBranch%',
			pages: {
				options: {
					remote: 'git@github.com:rluta/network-introduction.git'
				}
			},
			branch: 'gh-pages'
		}
	});

	// Dependencies
	require('load-grunt-tasks')(grunt);

	// Default task
	grunt.registerTask( 'default', [ 'css', 'js' ] );

	// JS task
	grunt.registerTask( 'js', [ 'jshint', 'uglify', 'qunit' ] );

	// Theme CSS
	grunt.registerTask( 'css-themes', [ 'sass:themes' ] );

	// Core framework CSS
	grunt.registerTask( 'css-core', [ 'sass:core', 'autoprefixer', 'cssmin' ] );

	// All CSS
	grunt.registerTask( 'css', [ 'sass', 'autoprefixer', 'cssmin' ] );

	// Package presentation to archive
	grunt.registerTask( 'package', [ 'default', 'zip' ] );

	// Serve presentation locally
	grunt.registerTask( 'serve', [ 'connect', 'watch' ] );

	// Run tests
	grunt.registerTask( 'test', [ 'jshint', 'qunit' ] );

	grunt.registerTask('build',  ['default','copy']);

	grunt.registerTask('deploy', 'Deploy to Github Pages', ['build','buildcontrol']);


};
