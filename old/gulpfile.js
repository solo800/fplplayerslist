var sassSrc = './sass/*.scss',
  cssDest = './css',
  gulp = require('gulp'),
  sass = require('gulp-sass');

gulp.task('sass', function() {
  return gulp.src(sassSrc)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(cssDest));
});

gulp.task('sass:watch', function() {
  gulp.watch(sassSrc, ['sass']);
});

gulp.task('default', ['sass', 'sass:watch'], function() {});
