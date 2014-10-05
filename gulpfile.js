var gulp = require('gulp'),
	browserify = require('gulp-browserify'),
	rename = require('gulp-rename'),
	clean = require('gulp-clean'),
	watch = require('gulp-watch'),
	marked = require('gulp-marked'),
	live = require('gulp-livereload');

gulp.task(
	'build',
	function () {
		gulp.src('./src/*.js', { read: false })
			.pipe(browserify())
			.pipe(gulp.dest('./pkg/'))
	});

gulp.task(
	'html',
	function(){
		gulp.src(['./src/area.html', './src/*.png'])
			.pipe(gulp.dest('./pkg/'))
	});

gulp.task(
	'md',
	function(){
		gulp.src('./src/*.md')
			.pipe(marked())
			.pipe(rename('./pkg/tutorial.html'))
			.pipe(gulp.dest('./'))
	});

gulp.task('watch', function() {
	gulp.watch(['./src/*'], ['build', 'html', 'md']);
});

gulp.task('default', ['build', 'html', 'md']);