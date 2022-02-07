var gulp = require('gulp'); 
    babel = require('gulp-babel'),
    del = require('del');

gulp.task('clean', function(){
  return del(['dest']);
});

gulp.task('transpile', function(){
  // return gulp.src(['src/*.js','src/**/*.js'])
  return gulp.src(['app.js','modules/**/*.js'])
    .pipe(babel({
      "plugins": [
        ["@babel/plugin-transform-modules-commonjs", {
          "importInterop": "none"
        }]
      ]
    }))  
    .pipe(gulp.dest('dest/temp'));
});
