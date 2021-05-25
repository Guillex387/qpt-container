import { Menu, app, BrowserWindow, ipcMain, dialog } from 'electron';
import Dialogs from './dialogs';
import path from 'path';
import Disks from './lib/disk';
import { handleError, handleErrorAsync } from './errors';
import { production } from './config';
import fs from 'fs';
import handleWork from './work';
import { EventEmitter } from 'events';
let mainEventHandler = new EventEmitter();
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
                                let content = Disks.getDiskObj(name).content
                                mainEventHandler.emit('new-disk', {
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
                                let content = Disks.getDiskObj(name).content
                                mainEventHandler.emit('new-disk', { name, content });
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
                                mainEventHandler.emit('rm-disk', selected);
                            }, (rolErr, msg) => {
                                Dialogs.openErrorDialog(rolErr, msg);
                            });
                        }
                    });
                }
            },
            {
                label: 'Reset disks files',
                click: () => {
                    Dialogs.openQuestionDialog('Are you sure?, this delete all storage info in the program').then((accepted) => {
                        if (accepted) {
                            Disks.resetProgramContent();
                            dialog.showMessageBoxSync({
                                type: 'info',
                                title: 'QPT container',
                                message: 'All files of the program are deleted, when you close this window the program finish the process'
                            });
                            app.quit();
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
                                let content = Disks.getDiskObj(name).content
                                mainEventHandler.emit('new-disk', {
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
                                let content = Disks.getDiskObj(name).content
                                mainEventHandler.emit('new-disk', { name, content });
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
                                mainEventHandler.emit('rm-disk', selected);
                            }, (rolErr, msg) => {
                                Dialogs.openErrorDialog(rolErr, msg);
                            });
                        }
                    });
                }
            },
            {
                label: 'Reset disks files',
                click: () => {
                    Dialogs.openQuestionDialog('Are you sure?, this delete all storage info in the program').then((accepted) => {
                        if (accepted) {
                            Disks.resetProgramContent();
                            dialog.showMessageBoxSync({
                                type: 'info',
                                title: 'QPT container',
                                message: 'All files of the program are deleted, when you close this window the program finish the process'
                            });
                            app.quit();
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
    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.on('close', () => {
        Disks.save();
        app.quit();
    });
}
app.on('ready', () => {
    Disks.init().then(deployMainWindow);
});
ipcMain.on('new-file', async (ev, originPath) => {
    handleWork(async () => {
        let files = await Dialogs.openFileDialog();
        let succesfulyCreated: string[] = [];
        for (let i = 0; i < files.length; i++) {
            await handleErrorAsync(async () => {
                await Disks.addFile(originPath, { name: files[i].name, mimeType: files[i].mimeType, content: files[i].content });
                succesfulyCreated.push(files[i].name);
            }, (rolErr, msg) => {
                Dialogs.openErrorDialog(rolErr, msg);
            });
        }
        ev.returnValue = succesfulyCreated;
    });
});
ipcMain.on('new-folder', async (ev, originPath, name) => {
    handleWork(() => {
        handleError(() => {
            Disks.addFolder(originPath, name);
            ev.returnValue = true;
        }, (rolErr, msg) => {
            ev.returnValue = false;
            Dialogs.openErrorDialog(rolErr, msg);
        });
    });
});
ipcMain.on('get-file', (ev, filePath) => {
    handleWork(async () => {
        await handleErrorAsync(async () => {
            const { data, mimeType } = await Disks.getFileContent(filePath);
            ev.returnValue = [data.toString('base64'), mimeType];
        }, (rolErr, msg) => {
            ev.returnValue = null;
            Dialogs.openErrorDialog(rolErr, msg);
        });
    });
});
ipcMain.on('remove-file', (ev, filePath) => {
    handleWork(async () => {
        await handleErrorAsync(async () => {
            await Disks.rmFile(filePath);
            ev.returnValue = true;
        }, (rolErr, msg) => {
            ev.returnValue = false;
            Dialogs.openErrorDialog(rolErr, msg);
        });
    });
});
ipcMain.on('remove-folder', (ev, folderPath) => {
    handleWork(async () => {
        await handleErrorAsync(async () => {
            await Disks.rmFolder(folderPath);
            ev.returnValue = true;
        }, (rolErr, msg) => {
            ev.returnValue = false;
            Dialogs.openErrorDialog(rolErr, msg);
        });
    });
});
ipcMain.on('message-box-confirm', async (ev, msg) => {
    let accepted = await Dialogs.openQuestionDialog(msg);
    ev.returnValue = accepted;
});
ipcMain.on('export-file', (ev, file: string) => {
    handleWork(async () => {
        let segments = file.split('/');
        let fileName = segments[segments.length - 1];
        let selectedPath = await Dialogs.openExportDialog(fileName);
        if (selectedPath !== undefined) {
            let savePath: string = selectedPath;
            await handleErrorAsync(async () => {
                let { data } = await Disks.getFileContent(file);
                fs.writeFileSync(savePath, data);
            }, (rolErr, msg) => {
                Dialogs.openErrorDialog(rolErr, msg);
            });
        }
    });
});
mainEventHandler.on('rm-disk', (delDiskName: string) => {
    mainWindow.webContents.send('rm-disk', delDiskName);
});
mainEventHandler.on('new-disk', (newDisk: { name: string, content: any }) => {
    mainWindow.webContents.send('new-disk', newDisk);
});