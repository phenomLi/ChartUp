const gulp = require('gulp'),
      uglify = require('gulp-uglify'),
      rename = require("gulp-rename"),
      minifycss = require('gulp-minify-css'),
      ts = require('gulp-typescript'),
      babel = require('gulp-babel');
    
const tsProject = ts.createProject('./tsconfig.json'); 
    

//typescript转译 + babel转译
gulp.task('main', function() {
    gulp.src('./ChartUp-dev.ts')
        .pipe(tsProject())
        .pipe(babel())
        .pipe(rename('ChartUp.js'))
        .pipe(gulp.dest('./../build/'))
        .pipe(uglify())
        .pipe(rename('ChartUp.min.js'))
        .pipe(gulp.dest('./../build/'));
});

//js压缩
gulp.task('jsmin', function() {
    gulp.src('./../build/ChartUp.js')
        .pipe(uglify())
        .pipe(rename('ChartUp.min.js'))
        .pipe(gulp.dest('./../build/'));
});

//css压缩
gulp.task('cssmin', function() {
    gulp.src('./../build/ChartUp.css')
        .pipe(minifycss())
        .pipe(rename('ChartUp.min.css'))
        .pipe(gulp.dest('./../build/'))
});


gulp.task('watch', function() {
    gulp.watch('./ChartUp-dev.ts', ['main']);
});


gulp.task('default', ['watch']);