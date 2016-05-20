import path from 'path'
import fs from 'fs'
import treeKill from 'tree-kill'

import { spawn } from 'child_process'

function findElectronBin () {
  // Reversed since we loop with while
  const electronBasePaths = [
    [ __dirname, '..', 'node_modules', '.bin' ],
    [ process.env.HOME, 'AppData', 'Roaming', 'npm' ],
    [ process.cwd(), 'node_modules', '.bin' ],
  ]

  let i = electronBasePaths.length
  while (i--) {
    const testPath = path.join(
        ...electronBasePaths[i],
        process.platform === 'win32' ? 'electron.cmd' : 'electron'
      )

    if (fs.existsSync(testPath)) {
      return testPath
    }
  }
}

let electronProcess
let shouldRestart

export function startProcess () {
  if (electronProcess) {
    return
  }

  const electronBin = findElectronBin()
  if (!electronBin) {
    return false
  }

  shouldRestart = false

  // Start electron with loggin and debugger
  // We need shell and detached to easily kill the group
  electronProcess = spawn(findElectronBin(), [
    'public/',
    '--remote-debugging-port=9222',
  ])

  // Pipe through stdio
  electronProcess.stdout.on('data', x => process.stdout.write(x))
  electronProcess.stderr.on('data', x => process.stderr.write(x))

  // Restart when the process exits
  electronProcess.on('exit', () => {
    electronProcess = undefined
    if (shouldRestart) {
      startProcess()
    }
  })
}

export function killProcess () {
  if (!electronProcess) {
    return
  }

  treeKill(electronProcess.pid, 'SIGINT')
}

export function restartProcess () {
  shouldRestart = true
  killProcess()
}
