module.exports = function (grunt) {

    grunt.registerTask('default', [ 'demo' ]);

    grunt.registerTask('demo', [
        'jshint',
        'clean:demo',
        'browserify:demo',
        'http-server:demo',
        'watch:demo',
        'clean:demo'
    ]);

    grunt.registerMultiTask('test', simpleMultiTaskRunner);


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: {
            demo: {
                dir: 'demo',
                files: [
                    'demo/index.js',
                    'demo/index.html'
                ],
                js: {
                    index: 'demo/index.js',
                    bundle: 'demo/demo.bundle.js'
                }
            },
            src: {
                js: {
                    dir: '.',
                    files: [
                        'index.js',
                        'lib/**/*.js',
                    ],
                    index: 'index.js'
                }
            },
            spec: {
                dir: 'test',
                bundle: 'test/<%= pkg.name %>.bundle.js',
                files: 'test/**/*.spec.js'
            }
        },
        clean: {
            demo: [ '<%= config.demo.js.bundle %>' ],
            test: [ '<%= config.spec.bundle %>' ]
        },
        test: {
            dev: [
                'jshint',
                'clean:test',
                'browserify:test-dev',
                'karma:unit',
                'watch:test',
                'clean:test'
            ],
            dist: [
                'jshint',
                'clean:test',
                'browserify:test-dist',
                'karma:unit',
                'clean:test'
            ]
        },
        browserify: {
            browserifyOptions: {
                debug: true
            },
            demo: {
                files: [{
                    src: '<%= config.demo.js.index %>',
                    dest: '<%= config.demo.js.bundle %>'
                }]
            },
            'test-dev': {
                files: [{
                    src: '<%= config.spec.files %>',
                    dest: '<%= config.spec.bundle %>'
                }],
                options: {
                    
                    plugin: [ 'proxyquireify/plugin' ]
                }
            },
            'test-dist': {
                files: [{
                    src: '<%= config.spec.files %>',
                    dest: '<%= config.spec.bundle %>'
                }],
                options: {
                    browserifyOptions: {
                        debug: false
                    },
                    plugin: [ 'proxyquireify/plugin' ]
                }
            }
        },
        watch: {
            demo: {
                options: {
                    livereload: true
                },
                files: [
                    '<%= config.src.js.files %>',
                    '<%= config.demo.files %>'
                ],
                tasks: [
                    'jshint',
                    'clean:demo',
                    'browserify:demo'
                ]
            },
            test: {
                files: [
                    '<%= config.src.js.files %>',
                    '<%= config.spec.files %>'
                ],
                tasks: [
                    'jshint',
                    'clean:test',
                    'browserify:test-dev',
                    'karma:unit',
                ]
            }
        },
        jshint: {
            files: [
                'gruntfile.js',
                '<%= config.spec.files %>',
                '<%= config.src.js.files %>'
            ]
        },
        'http-server': {
            demo: {
                root: '.',
                port: 8080,
                host: '127.0.0.1',
                cache: -1,
                showDir : true,
                autoIndex: true,
                defaultExt: 'html',
                runInBackground: true
            }
        },
        karma: {
            unit: {
                options: {
                    configFile: '<%= config.spec.dir %>/karma.conf.js',
                    files: [
                        '<%= config.spec.dir %>/phantomjs-extensions.js',
                        '<%= config.spec.bundle %>'
                    ]
                }
            }
        },
    });

    require('load-grunt-tasks')(grunt);


    function simpleMultiTaskRunner() {
        grunt.task.run(this.data);
    }

};
