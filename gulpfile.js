import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';

gulp.task('clean', function(){
  return del(['dest']);
});

gulp.task('transpile', function(){
  return gulp.src(['src/*.js','src/**/*.js'])
  // return gulp.src(['app.js','modules/**/*.js'])
    .pipe(babel({
      "plugins": [
        ["@babel/plugin-transform-modules-commonjs", {
          "importInterop": "none"
        }]
      ]
    }))  
    .pipe(gulp.dest('bin/src'));
});
