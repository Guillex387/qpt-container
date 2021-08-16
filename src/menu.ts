import { BrowserWindow, Menu, MenuItem } from 'electron';
import { EventEmitter } from 'events';
import Dialogs from './dialogs';
import { handleError } from './errors';
import Disks from './disks.controller';
import { production } from './config';

export default function constructMenu(eventHandler: EventEmitter, window: BrowserWindow) {
    let menuHandler = new MenuHandler(eventHandler, window);
    let devSubmenu = Menu.buildFromTemplate([{
        label: 'DevTools',
        accelerator: 'F12',
        click: menuHandler.openDevTools
    }]);
    let devItem = new MenuItem({ label: 'Dev', submenu: devSubmenu });
    let diskSubmenu = Menu.buildFromTemplate([
        {
            label: 'Load disk',
            accelerator: 'Ctrl+Alt+L',
            click: menuHandler.loadDisk
        },
        {
            label: 'Add disk',
            accelerator: 'Ctrl+Alt+A',
            click: menuHandler.addDisk
        },
        {
            label: 'Remove disk',
            accelerator: 'Ctrl+Alt+R',
            click: menuHandler.removeDisk
        },
        {
            label: 'Export disk',
            accelerator: 'Ctrl+Alt+E',
            click: menuHandler.exportDisk
        },
        {
            label: 'Import disk',
            accelerator: 'Ctrl+Alt+I',
            click: menuHandler.importDisk
        }
    ]);
    let diskItem = new MenuItem({ label: 'Disk', submenu: diskSubmenu });
    let mainMenu: Menu = new Menu();
    (!production) && mainMenu.append(devItem);
    mainMenu.append(diskItem);
    return mainMenu;
}

class MenuHandler {
    private eventHandler: EventEmitter;
    private mainWindow: BrowserWindow;
    constructor(eventHandler: EventEmitter, mainWindow: BrowserWindow) {
        this.eventHandler = eventHandler;
        this.mainWindow = mainWindow;
    }

    public openDevTools = () => this.mainWindow.webContents.openDevTools();
    public loadDisk = () => {
        const newDiskEv = (obj: any) => this.eventHandler.emit('new-disk', obj);
        Dialogs.openDiskDialog('load').then(val => {
            if (val) {
                const { name, pass } = val;
                handleError(() => {
                    Disks.load(name, pass);
                    const content = Disks.getDisk(name).tree;
                    newDiskEv({ name, content });
                }, (rolErr, msg) => {
                    Dialogs.openErrorDialog(rolErr, msg);
                });
            }
        });
    }
    public addDisk = () => {
        const newDiskEv = (obj: any) => this.eventHandler.emit('new-disk', obj);
        Dialogs.openDiskDialog('add', [750, 250]).then(val => {
            if (val) {
                const { name, pass } = val;
                handleError(() => {
                    Disks.createDisk(name, pass);
                    const content = Disks.getDisk(name).tree;
                    newDiskEv({ name, content });
                }, (rolErr, msg) => {
                    Dialogs.openErrorDialog(rolErr, msg);
                });
            }
        });
    }
    public removeDisk = () => {
        const rmDiskEv = (obj: any) => this.eventHandler.emit('rm-disk', obj);
        Dialogs.openDiskDialog('remove').then(val => {
            if (val) {
                const { name, pass } = val;
                handleError(() => {
                    Disks.rmDisk(name, pass);
                    rmDiskEv(name);
                }, (rolErr, msg) => {
                    Dialogs.openErrorDialog(rolErr, msg);
                });
            }
        });
    }
    public exportDisk = () => {
        Dialogs.openDiskDialog('export').then(val => {
            if (val) {
                const { name, pass } = val;
                handleError(async () => {
                    let destPath = await Dialogs.openExportDialog(name + '.dsk', true);
                    await Disks.exportDisk(name, pass, destPath);
                }, (rolErr, msg) => {
                    Dialogs.openErrorDialog(rolErr, msg);
                });
            }
        });
    }
    public importDisk = () => {
        const newDiskEv = (obj: any) => this.eventHandler.emit('new-disk', obj);
        Dialogs.openFileDialog(true, 'Open disk file').then(files => {
            if (files.length === 0) return;
            const file = files[0];
            handleError(async () => {
                const { name, pass } = await Dialogs.openDiskDialog('import', [750, 250]);
                Disks.importDisk(name, pass, file.content);
                const content = Disks.getDisk(name).tree;
                newDiskEv({ name, content });
            }, (rolErr, msg) => {
                Dialogs.openErrorDialog(rolErr, msg);
            });
        });
    }
}