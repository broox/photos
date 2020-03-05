const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const gulp = require('gulp');
const merge = require('merge-stream');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');

gulp.task('concatenate-css-libraries', () => {
  const appStream = gulp.src('./app/static/css/src/*.scss')
  .pipe(sass({ errLogToConsole: true, outputStyle: 'compressed' }));

  const libStream = gulp.src('./app/static/css/lib/*.css');

  return merge(appStream, libStream)
  .pipe(concat('lib.css'))
  .pipe(cleanCSS())
  .pipe(gulp.dest('./app/static/css'));
});

gulp.task('concatenate-js-libraries', () => {
  const minified = gulp.src([
    './app/static/js/lib/vue.min.js',
    './app/static/js/lib/vuex.min.js',
    './app/static/js/lib/vue-router.min.js',
    './app/static/js/lib/flex-images.min.js',
    './app/static/js/lib/photoswipe.min.js',
  ]);

  const bigBoys = gulp.src('./app/static/js/lib/photoswipe-ui.js')
  .pipe(terser());

  return merge(minified, bigBoys)
  .pipe(concat('lib.min.js'))
  .pipe(gulp.dest('./app/static/js'));
});

gulp.task('jslib', ['concatenate-css-libraries', 'concatenate-js-libraries']);

gulp.task('js', () => {
  return gulp.src([
    './app/static/js/src/util.js',
    './app/static/js/src/album.js',
    './app/static/js/src/photo.js',
    './app/static/js/src/tag.js',
    './app/static/js/src/data.js',
    './app/static/js/src/photos-mixin.js',
    './app/static/js/src/components/*.js',
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
    './app/static/js/src/*',
    './app/static/js/src/*/*'
  ], () => {
    gulp.run(['jslib', 'js']);
  });
});

gulp.task('default', ['jslib', 'js']);
gulp.task('watch', ['watch-client-files'])