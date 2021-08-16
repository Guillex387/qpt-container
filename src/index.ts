import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import constructMenu from './menu';
import mainEvents from './mainEvents.handler';
import { production, appIcon, isLinux } from './config';
import { EventEmitter } from 'events';
let windowsEvents = new EventEmitter();
let mainWindow: BrowserWindow;
const mainHtml = path.join(__dirname, '..', 'views', 'index.html');

function deployMainWindow(): void {
    mainWindow = new BrowserWindow({
        show: false,
        darkTheme: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: !production
        }
    });
    let menu = constructMenu(windowsEvents, mainWindow);
    mainWindow.setMenu(menu);
    isLinux && mainWindow.setIcon(appIcon);
    mainWindow.loadFile(mainHtml);
    mainWindow.maximize();
    mainWindow.on('ready-to-show', mainWindow.show);
    mainWindow.on('closed', app.quit);
}
app.whenReady().then(deployMainWindow);
ipcMain.on('new-file', mainEvents.newFile);
ipcMain.on('new-folder', mainEvents.newFolder);
ipcMain.on('get-file', mainEvents.getFile);
ipcMain.on('remove-file', mainEvents.rmFile);
ipcMain.on('remove-folder', mainEvents.rmFolder);
ipcMain.on('message-box-confirm', mainEvents.msgBoxConfirm);
ipcMain.on('export-file', mainEvents.exportFile);
windowsEvents.on('rm-disk', (delDiskName: string) => {
    mainWindow.webContents.send('rm-disk', delDiskName);
});
windowsEvents.on('new-disk', (newDisk: { name: string, content: any }) => {
    mainWindow.webContents.send('new-disk', newDisk);
});