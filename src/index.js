import {
  restartProcess,
} from './electronProcess'

const defaults = {
  src: 'electron-app',
  dest: 'public',
}

export default function (Parched) {
  Parched.addDependencyToWatch('electron-copy-all')
  Parched.addDependencyToWatch('electron-watch')
  Parched.addDependencyToBuild('electron-copy-all')

  const gulp = Parched.vendor.gulp()
  const options = {
    ...defaults,
    ...(Parched.getAppConfig().electron || {}),
  }

  // Run these in parallel
  gulp.task('electron-copy-all', false, [
    'electron-copy-app',
    'electron-copy-app-modules',
  ])

  // Pass electron main files through Parched
  // Ignore node_modules since it doesn't need to be transformed
  Parched.createTask({
    taskName: 'electron-copy-app',
    src: [
      `${options.src}/**/*`,
      `!${options.src}/node_modules/**/*`,
    ],
    sequence: [
      'transform',
    ],
    afterTransform (stream) {
      return stream.pipe(gulp.dest(`${options.dest}/`))
          .on('end', restartProcess)
    }
  })

  // Copy over node_modules
  gulp.task('electron-copy-app-modules', false, function () {
    return gulp
        .src(`${options.src}/node_modules/**/*`, { base: options.src })
        .pipe(gulp.dest(`${options.dest}/`))
  })

  gulp.task('electron-watch', false, function (done) {
    // Recompile files in options.src when changed
    Parched.vendor.watch([
      `${options.src}/**/*`,
    ], function () {
      gulp.start('electron-copy-app')
    })

    done()
  })
}
