var gulp = require('gulp');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var clean = require('gulp-clean');

gulp.task(
	'build',
	function () {
		gulp.src(['./src/sail.js', './src/area.html'], { read: false })
			.pipe(browserify())
			.pipe(gulp.dest('./pkg/'));
});

gulp.task('default', ['build']);