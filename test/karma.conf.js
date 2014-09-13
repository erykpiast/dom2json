module.exports = function (config) {
    config.set({
        basePath: '../',

        frameworks: [ 'jasmine' ],

        files: [ /* definition in gruntfile */ ],

        reporters: [ 'dots' ],
        colors: true,
        logLevel: config.LOG_INFO,
        
        port: 9876,
        autoWatch: false,

        browsers: [ 'PhantomJS'/*, 'Chrome'*/ ],
        singleRun: true
    });
};