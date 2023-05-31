var gulp = require('gulp');
var webserver = require('gulp-webserver');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
const sass = require('gulp-sass')(require('sass'));
var paths = {
    pages: ['./public/*.html', './public/**/images/**','./public/*.css']
};

function copyHTML() {
    return gulp.src(paths.pages[0])
    .pipe(gulp.dest('dist/'));
}

function copyImages() {
    return gulp.src(paths.pages[1])
    .pipe(gulp.dest('dist/'));
}

function copyCss() {
    return gulp.src(paths.pages[2])
    .pipe(gulp.dest('dist/'));
}


function bundle() {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/main.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist/'));
}



function watch() {
    gulp.watch('./src/**/*.ts', gulp.series(copyHTML, bundle));
    gulp.watch('./public/**/*.html', gulp.series(copyHTML, bundle));
}

function liveReload() {
    gulp.src('dist/').pipe(webserver({
        livereload: true,
        port:9000,
        open: 'index.html'
    }));
}

const wt = () => watch();
const live = () => liveReload();

exports.bundle = gulp.parallel(bundle, copyHTML,copyCss, copyImages);
exports.watch = gulp.series(copyHTML, copyCss, bundle, copyImages, gulp.parallel(wt, live));
