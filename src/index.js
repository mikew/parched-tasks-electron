import {
  restartProcess,
} from './electronProcess'

export default function (Parched) {
  Parched.addDependencyToWatch('electron-copy-all')
  Parched.addDependencyToWatch('electron-watch')
  Parched.addDependencyToBuild('electron-copy-all')

  const gulp = Parched.vendor.gulp()
  const srcDir = 'electron-app'
  const destDir = 'public'

  // Run these in parallel
  gulp.task('electron-copy-all', [
    'electron-copy-app',
    'electron-copy-app-modules',
  ])

  // Pass electron main files through Parched
  // Ignore node_modules since it doesn't need to be transformed
  Parched.createTask({
    taskName: 'electron-copy-app',
    src: [
      `${srcDir}/**/*`,
      `!${srcDir}/node_modules/**/*`,
    ],
    sequence: [
      'transform',
    ],
    afterTransform (stream) {
      return stream.pipe(gulp.dest(`${destDir}/`))
          .on('end', restartProcess)
    }
  })

  // Copy over node_modules
  gulp.task('electron-copy-app-modules', function () {
    return gulp
        .src(`${srcDir}/node_modules/**/*`, { base: srcDir })
        .pipe(gulp.dest(`${destDir}/`))
  })

  gulp.task('electron-watch', function (done) {
    // Recompile files in srcDir when changed
    Parched.vendor.watch([
      `${srcDir}/**/*`,
    ], function () {
      gulp.start('electron-copy-app')
    })

    done()
  })
}
