import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';
import sourcemaps from 'gulp-sourcemaps';

gulp.task('clean', () => del(['dist/src']));

gulp.task('transpile', () =>
  gulp
    .src(['src/*.js', 'src/**/*.js'])
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(
      babel({
        plugins: [
          [
            '@babel/plugin-transform-modules-commonjs',
            {
              importInterop: 'babel',
            },
          ],
        ],
      })
    )
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/src'))
);

gulp.task('resources', () =>
  gulp.src(['src/**/*.json'], { base: './' }).pipe(gulp.dest('dist'))
);

gulp.task('default', gulp.series('clean', 'transpile', 'resources'));
