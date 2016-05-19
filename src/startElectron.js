import {
  startProcess,
} from './electronProcess'

let hasBuiltOnce = false
function noop () {}

export default function startElectron (done = noop) {
  if (!global.isWatching) {
    done()
    return
  }

  if (hasBuiltOnce) {
    done()
    return
  }

  const didStart = startProcess()
  if (didStart === false) {
    done(new Error('Could not start electron'))
    return
  }
  hasBuiltOnce = true
  done()
}
