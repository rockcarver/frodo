import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';
import sourcemaps from 'gulp-sourcemaps';
import map from 'map-stream';

gulp.task('clean', () => del(['dist/src']));

gulp.task('package', () =>
  gulp
    .src('*.json')
    .pipe(
      map((file, done) => {
        const json = JSON.parse(file.contents.toString());
        delete json.type;
        // eslint-disable-next-line no-param-reassign, no-buffer-constructor
        file.contents = new Buffer(JSON.stringify(json));
        done(null, file);
      })
    )
    .pipe(gulp.dest('dist'))
);

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
          ['babel-plugin-transform-import-meta'],
        ],
      })
    )
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/src'))
);

gulp.task('resources', () =>
  gulp.src(['src/**/*.json'], { base: './' }).pipe(gulp.dest('dist'))
);

gulp.task('default', gulp.series('clean', 'package', 'transpile', 'resources'));
