const { app, BrowserWindow, Menu } = require('../refactor/electron');

import * as path from 'path'
import { format as formatUrl } from 'url'

import buildMenu from 'menu'

const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = !isProduction

// allows app to find node when launched from GUI

let mainWindow
let menu

const [, openPath] = process.argv
function createMainWindow() {
  const w = new BrowserWindow({
    webPreferences: {
      webSecurity: false,
    },
    backgroundColor: '#2A2A35',
    show: false,
  })

  w.once('ready-to-show', () => {
    // if we double clicked on mjml file (or launched app with argument)
    // we send path to renderer, to directly open/create project
    if (openPath) {
      mainWindow.webContents.send('openPath', openPath)
    }
    w.show()
  })

  const url = isDevelopment
    ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
    : formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      })

  const template = buildMenu(w)

  menu = Menu.buildFromTemplate(template)

  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(menu)
  } else {
    w.setMenu(menu)
  }

  w.loadURL(url)
  w.on('closed', () => (mainWindow = null))

  return w
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})
app.on('ready', async () => {
  mainWindow = createMainWindow()
})
