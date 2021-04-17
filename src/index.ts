import { Menu, app, BrowserWindow, ipcMain, dialog } from 'electron';
import Dialogs from './dialogs';
import path from 'path';
import Disks from './disk';
import mainEventHandler from './mainEvents';
import { handleError, handleErrorAsync } from './errors';
import { production } from './config';
import fs from 'fs'
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
                    Dialogs.openLoadDiskDialog((name, pass) => {
                        if (name !== '' && pass !== '') {
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
                    Dialogs.openAddDiskDialog((name, pass) => {
                        if (name !== '' && pass !== '') {
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
                    Dialogs.openRemoveDiskDialog((selected, pass) => {
                        if (selected !== '' && pass !== '') {
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
                    Dialogs.openLoadDiskDialog((name, pass) => {
                        if (name !== '' && pass !== '') {
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
                    Dialogs.openAddDiskDialog((name, pass) => {
                        if (name !== '' && pass !== '') {
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
                    Dialogs.openRemoveDiskDialog((selected, pass) => {
                        if (selected !== '' && pass !== '') {
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
let working = false;
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function handleWork(func: () => any) {
    if (!working) {
        working = true;
        await func();
        working = false;
        return;
    }
    await sleep(60);
    await handleWork(func);
    return;
}
mainEventHandler.on('disks-ready', () => {
    app.on('ready', deployMainWindow);
});
ipcMain.on('new-file', async (ev, originPath) => {
    await handleWork(async () => {
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
    await handleWork(() => {
        handleError(() => {
            Disks.addFolder(originPath, name);
            ev.returnValue = true;
        }, (rolErr, msg) => {
            ev.returnValue = false;
            Dialogs.openErrorDialog(rolErr, msg);
        });
    });
});
ipcMain.on('get-file', async (ev, filePath) => {
    await handleWork(async () => {
        await handleErrorAsync(async () => {
            const { data, mimeType } = await Disks.getFileContent(filePath);
            ev.returnValue = [data.toString('base64'), mimeType];
        }, (rolErr, msg) => {
            ev.returnValue = null;
            Dialogs.openErrorDialog(rolErr, msg);
        });
    });
});
ipcMain.on('remove-file', async (ev, filePath) => {
    await handleWork(async () => {
        await handleErrorAsync(async () => {
            await Disks.rmFile(filePath);
            ev.returnValue = true;
        }, (rolErr, msg) => {
            ev.returnValue = false;
            Dialogs.openErrorDialog(rolErr, msg);
        });
    });
});
ipcMain.on('remove-folder', async (ev, folderPath) => {
    await handleWork(async () => {
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
ipcMain.on('export-file', async (ev, file: string) => {
    await handleWork(async () => {
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