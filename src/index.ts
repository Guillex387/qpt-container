import { Menu, app, BrowserWindow, ipcMain } from 'electron';
import Dialogs from './dialogs';
import * as path from 'path';
import Disks from './disks.controller';
import { handleError } from './errors';
import mainEvents from './mainEvents.handler';
import { production, cacheFolder } from './config';
import * as fs from 'fs';
import { EventEmitter } from 'events';
let windowsEvents = new EventEmitter();
const mainHtml = path.join(__dirname, '..', 'views', 'index.html');
let mainWindow: BrowserWindow;
const devMenu: Menu = Menu.buildFromTemplate([
    {
        label: 'Develop',
        submenu: [
            {
                label: 'Debug',
                accelerator: 'F12',
                click: () => mainWindow.webContents.openDevTools()
            }
        ]
    },
    {
        label: 'Disk',
        submenu: [
            {
                label: 'Load disk',
                accelerator: 'Ctrl+L',
                click: () => {
                    Dialogs.openLoadDiskDialog(mainWindow).then(val => {
                        if (val) {
                            const { name, pass } = val;
                            handleError(() => {
                                Disks.load(name, pass);
                                let content = Disks.getDisk(name).tree;
                                windowsEvents.emit('new-disk', {
                                    name,
                                    content
                                });
                            }, (rolErr, msg) => {
                                Dialogs.openErrorDialog(rolErr, msg);
                            });
                        }
                    });
                }
            },
            {
                label: 'Add disk',
                accelerator: 'Ctrl+A',
                click: () => {
                    Dialogs.openAddDiskDialog(mainWindow).then(val => {
                        if (val) {
                            const { name, pass } = val;
                            handleError(() => {
                                Disks.createDisk(name, pass);
                                let content = Disks.getDisk(name).tree;
                                windowsEvents.emit('new-disk', { name, content });
                            }, (rolErr, msg) => {
                                Dialogs.openErrorDialog(rolErr, msg);
                            });
                        }
                    });
                }
            },
            {
                label: 'Remove disk',
                accelerator: 'Ctrl+R',
                click: () => {
                    Dialogs.openRemoveDiskDialog(mainWindow).then(val => {
                        if (val) {
                            const { selected, pass } = val;
                            handleError(() => {
                                Disks.rmDisk(selected, pass);
                                windowsEvents.emit('rm-disk', selected);
                            }, (rolErr, msg) => {
                                Dialogs.openErrorDialog(rolErr, msg);
                            });
                        }
                    });
                }
            }
        ]
    }
]);
const distMenu: Menu = Menu.buildFromTemplate([
    {
        label: 'Disk',
        submenu: [
            {
                label: 'Load disk',
                accelerator: 'Ctrl+L',
                click: () => {
                    Dialogs.openLoadDiskDialog(mainWindow).then(val => {
                        if (val) {
                            const { name, pass } = val;
                            handleError(() => {
                                Disks.load(name, pass);
                                let content = Disks.getDisk(name).tree;
                                windowsEvents.emit('new-disk', {
                                    name,
                                    content
                                });
                            }, (rolErr, msg) => {
                                Dialogs.openErrorDialog(rolErr, msg);
                            });
                        }
                    });
                }
            },
            {
                label: 'Add disk',
                accelerator: 'Ctrl+A',
                click: () => {
                    Dialogs.openAddDiskDialog(mainWindow).then(val => {
                        if (val) {
                            const { name, pass } = val;
                            handleError(() => {
                                Disks.createDisk(name, pass);
                                let content = Disks.getDisk(name).tree;
                                windowsEvents.emit('new-disk', { name, content });
                            }, (rolErr, msg) => {
                                Dialogs.openErrorDialog(rolErr, msg);
                            });
                        }
                    });
                }
            },
            {
                label: 'Remove disk',
                accelerator: 'Ctrl+R',
                click: () => {
                    Dialogs.openRemoveDiskDialog(mainWindow).then(val => {
                        if (val) {
                            const { selected, pass } = val;
                            handleError(() => {
                                Disks.rmDisk(selected, pass);
                                windowsEvents.emit('rm-disk', selected);
                            }, (rolErr, msg) => {
                                Dialogs.openErrorDialog(rolErr, msg);
                            });
                        }
                    });
                }
            }
        ]
    }
]);
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
    mainWindow.setMenu(production ? distMenu : devMenu);
    mainWindow.loadFile(mainHtml);
    mainWindow.maximize();
    mainWindow.on('ready-to-show', mainWindow.show);
    mainWindow.on('closed', () => {
        cacheFolder && fs.rmSync(cacheFolder, { recursive: true });
        app.quit();
    });
}
app.whenReady().then(async () => {
    await Disks.init();
    deployMainWindow();
});
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