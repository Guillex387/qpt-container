const { BrowserWindow, app, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

const mainHtml = path.join(__dirname, 'index.html');
const mainMenu = isDev ?
  Menu.buildFromTemplate([
    {
      label: 'Development Tools',
      accelerator: 'F12',
      role: 'toggleDevTools'
    },
    {
      label: 'Reload Window',
      accelerator: 'F5',
      role: 'reload'
    }
  ])
  :
  null;

function deployWindow(html, menu = null) {
  let window = new BrowserWindow({
    show: false,
    darkTheme: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: isDev
    }
  });
  window.setMenu(menu);
  window.loadFile(html);
  window.maximize();
  window.on('ready-to-show', window.show);
  window.on('closed', app.quit);
}

app.whenReady()
  .then(() => {
    if (isDev) {
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron')
      });
    }
    deployWindow(mainHtml, mainMenu);
  })
  .catch(reason => {
    console.log(reason);
    app.quit();
  });