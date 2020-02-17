const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const gulp = require('gulp');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');

gulp.task('concatenate-css-libraries', () => {
  return gulp.src(['./app/static/css/src/*.css', './app/static/css/lib/*.css'])
  .pipe(concat('lib.css'))
  .pipe(cleanCSS())
  .pipe(gulp.dest('./app/static/css'));
});

gulp.task('concatenate-js-libraries', () => {
  return gulp.src([
    './app/static/js/lib/vue.min.js',
    './app/static/js/lib/flex-images.min.js',
    './app/static/js/lib/photoswipe.min.js',
    './app/static/js/lib/photoswipe-ui.min.js',
  ])
  .pipe(concat('lib.min.js'))
  .pipe(gulp.dest('./app/static/js'));
});

gulp.task('jslib', ['concatenate-css-libraries', 'concatenate-js-libraries']);

gulp.task('js', () => {
  return gulp.src([
    './app/static/js/src/util.js',
    './app/static/js/src/photos-mixin.js',
    './app/static/js/src/app.js',
  ])
  .pipe(concat('app.combined.js'))
  .pipe(gulp.dest('./app/static/js'))
  .pipe(rename('app.min.js'))
  .pipe(terser())
  .pipe(sourcemaps.write('./app/static/js'))
  .pipe(gulp.dest('./app/static/js'))
});

gulp.task('watch-client-files', () => {
  gulp.watch([
    './app/static/css/lib/*',
    './app/static/css/src/*',
    './app/static/js/lib/*',
    './app/static/js/src/*'
  ], () => {
    gulp.run(['jslib', 'js']);
  });
});

gulp.task('default', ['jslib', 'js']);
gulp.task('watch', ['watch-client-files'])