var gulp = require('gulp');
var traceur = require('gulp-traceur');
var coffee = require('gulp-coffee');
var ext = require('gulp-ext');
var react = require('gulp-react');

var sources  = {
  jscode: ['lib/*.js', 'lib/*.es6'],
  jsxcode: 'lib/*.jsx',
  cscode: 'lib/*.coffee'
};

gulp.task('default', function() {});

gulp.task('jscode', function() {
  return gulp.src(sources.jscode)
                .pipe(traceur()).on('error', logError)
                .pipe(ext.replace('js', 'es6'))
                .pipe(gulp.dest('build'));
});

gulp.task('jsxcode', function() {
  return gulp.src(sources.jsxcode)
                .pipe(react({harmony: true}).on('error', logError))
                .pipe(traceur()).on('error', logError)
                .pipe(gulp.dest('build'));
});

gulp.task('cscode', function() {
  return gulp.src(sources.cscode)
                .pipe(coffee()).on('error', logError)
                .pipe(react({harmony: true}))
                .pipe(gulp.dest('build'));
});

gulp.watch(sources.jscode, ['jscode']);
gulp.watch(sources.cscode, ['cscode']);
gulp.watch(sources.jsxcode, ['jsxcode']);

function logError(error) {
  console.warn(error);
  this.emit('end');
}
