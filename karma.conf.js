module.exports = function(config) {
  config.set({
    // base path that will be used to resolve
    // all patterns (eg. files, exclude)
    basePath: '',
    frameworks: [
      'mocha', 'chai', 'sinon'
    ],
    files: [
      'public/lib/angular/**/*.js',
      'public/lib/jquery/**/*.js',
      'public/lib/mousetrap/js/mousetrap.min.js',
      'public/lib/mousetrap/js/mousetrap-global-bind.js',
      'public/lib/angular-mousetrap/**/*.js',
      'public/lib/angular-mocks/**/*.js',
      'public/lib/angular-ui-router/**/*.js',
      'public/lib/angular-animate/**/*.js',
      'public/app/app.js',
      'tests/unit/**/*.spec.js'
    ],
    exclude: [],
    reporters: [
      'mocha'
    ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_DEBUG,
    autoWatch: true,
    browsers: [
      'NodeWebkit'
    ],
    singleRun: false
  });
};
