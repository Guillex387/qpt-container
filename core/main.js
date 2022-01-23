const { BrowserWindow, app, Menu, dialog, ipcMain } = require('electron');
const { platform } = require('os');
const path = require('path');
const isDev = require('electron-is-dev');
const open = require('open');

const appFolder = path.join(app.getPath('exe'), '..');
const mainHtml = path.join(__dirname, 'index.html');
const appIcon = isDev ?
  path.join(__dirname, '..', 'assets', 'logo.png')
  :
  path.join(appFolder, 'logo.png');
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
  (platform() === 'linux') && window.setIcon(appIcon);
  window.setMenu(menu);
  window.loadFile(html);
  window.maximize();
  window.on('ready-to-show', window.show);
  window.webContents.on('will-navigate', (e, url) => {
    e.preventDefault();
    open(url);
  });
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

ipcMain.on('error-box', (e, code, message) => {
  dialog.showErrorBox(`Error ${code}`, message);
});
ipcMain.on('open-box', (e, options) => {
  e.returnValue = dialog.showOpenDialogSync(options);
});
ipcMain.on('save-box', (e, options) => {
  e.returnValue = dialog.showSaveDialogSync(options);
});