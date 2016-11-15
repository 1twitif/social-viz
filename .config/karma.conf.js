// Karma configuration
// Generated on Tue Nov 15 2016 01:44:25 GMT+0100 (Paris, Madrid)

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs'],
    files: [
	    //{pattern: 'node_modules/d3/build/d3.js', included: false},
	    //{pattern: 'node_modules/js-yaml/dist/js-yaml.js', included: false},
	    {pattern: 'staticApp/**/*.js', included: false},
	    '.config/test-main.js'
    ],
    exclude: [
    	'staticApp/main.js'
    ],
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
	    'staticApp/**/!(*.test|*.spec|*.mock).js': 'coverage'
    },
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress','coverage'],
	  coverageReporter: {
		  type : 'html',
		  dir : 'coverage/'
	  },
    port: 9876,
    colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
	  //browsers: ['Chrome', 'Firefox', 'PhantomJS'],
	  browsers: [],
	  autoWatch: true,
    singleRun: false,
    concurrency: Infinity
  })
};
