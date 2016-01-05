var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var streamify = require('gulp-streamify');
var zip = require('gulp-zip');

var karma = require('karma').server;
var runSequence = require('run-sequence');
var webkit = require('node-webkit-builder');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var del = require('del');

gulp.task('javascript', function() {
  browserify('./app/app.js').bundle()
    .pipe(source('app.js'))
    .pipe(streamify(replace('require', 'requireClient')))
    .pipe(streamify(replace('nequire', 'require')))
    .pipe(gulp.dest('./public/app/'));

  gulp.src('./app/worker.js')
   .pipe(gulp.dest('./public/app/'));
});

gulp.task('templates', function () {
  gulp.src('./app/tpl/**')
    .pipe(gulp.dest('./public/tpl/'));
});

gulp.task('css', function() {
  gulp.src('./app/app.scss')
    .pipe(concat('app.css'))
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(gulp.dest('./public/app/'));
});

gulp.task('karma', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    autoWatch: false
  }, done);
});

gulp.task('watch', function() {
  gulp.watch([
    './app/**/*',
    './public/*.*',
    './tests/**/*'
  ], ['default']);
});

gulp.task('build', function() {
  new webkit({
      version: '0.12.1',
      files: './public/**',
      platforms: ['osx64'],
      macIcns: './public/img/app.icns',
      macPlist: { mac_bundle_id: 'BambooShoot' },
      appName: 'BambooShoot'
  }).build();
});

gulp.task('build-zip', function() {
  gulp.src('./build/BambooShoot/osx64/**/*')
    .pipe(zip('BambooShoot.zip'))
    .pipe(gulp.dest('./build/'));
});

gulp.task('clean', function() {
  del([
    './public/app',
    './public/tpl',
    './build',
    './cache'
  ]);
});

gulp.task('test', function(callback) {
  runSequence('default', 'karma', callback);
});

gulp.task('default', [
  'css',
  'templates',
  'javascript'
]);
