var gulp = require('gulp');
var traceur = require('gulp-traceur');
var ext = require('gulp-ext');

var sources  = {
  jscode: ['lib/*.js', 'lib/*.es6'],
};

gulp.task('default', function() {});

gulp.task('jscode', function() {
  return gulp.src(sources.jscode)
                .pipe(traceur()).on('error', logError)
                .pipe(ext.replace('js', 'es6'))
                .pipe(gulp.dest('build'));
});

gulp.watch(sources.jscode, ['jscode']);

function logError(error) {
  console.warn(error);
  this.emit('end');
}
