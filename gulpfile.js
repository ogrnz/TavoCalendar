'use strict';
 
var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
 
sass.compiler = require('node-sass');
 
gulp.task('sass', function () {
  return gulp.src('./src/scss/tavo-calendar.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist'));
});

gulp.task('deliver-js', function () {
    return gulp.src('./src/TavoCalendar.js')
      .pipe(rename('tavo-calendar.js'))
      .pipe(gulp.dest('./dist'));
});

gulp.task('build', gulp.series('sass', 'deliver-js'));

gulp.task('watch', function () {
   gulp.watch('./src/scss/**/*.scss', gulp.series('sass'))
   gulp.watch('./src/TavoCalendar.js', gulp.series('deliver-js'))
})