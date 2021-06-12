import { dialog, BrowserWindow, ipcMain } from 'electron';
import Disks from './disks.controller';
import * as mime from 'mime-types';
import * as fs from 'fs';
import * as path from 'path';
const addDiskHtml = path.join(__dirname, '..', 'views', 'addDisk.html');
const loaderHtml = path.join(__dirname, '..', 'views', 'loader.html');
const removeDiskHtml = path.join(__dirname, '..', 'views', 'removeDisk.html');
class Dialogs {
    private static dialogOpened: boolean = false;
    public static async openFileDialog(): Promise<{
        name: string;
        mimeType: string;
        content: Buffer;
    }[]> {
        let paths = dialog.showOpenDialogSync({
            properties: ['openFile', 'multiSelections'],
            title: 'Open file'
        }) || [];
        let files: {
            name: string;
            mimeType: string;
            content: Buffer;
        }[] = [];
        paths.forEach(e => {
            let _content: Buffer = fs.readFileSync(e);
            let _name: string = path.basename(e);
            let _mimeType: string = mime.lookup(_name) || '';
            files.push({
                name: _name,
                mimeType: _mimeType,
                content: _content
            });
        });
        return files;
    }
    public static async openExportDialog(defaultFile: string = ''): Promise<string | undefined> {
        let segments = defaultFile.split('.');
        let extension = segments[segments.length - 1];
        return dialog.showSaveDialogSync({
            title: 'Export file',
            buttonLabel: 'Export',
            defaultPath: defaultFile,
            filters: [
                { name: 'Original extension', extensions: [extension] },
                { name: 'All extensions', extensions: ['*'] }
            ]
        });
    }
    public static async openQuestionDialog(question: string): Promise<boolean> {
        let code: number = dialog.showMessageBoxSync({
            message: question,
            type: 'question',
            title: 'qpt-container',
            buttons: ['Yes', 'No']
        });
        return (code == 0);
    }
    public static async openErrorDialog(rolError: string, errorMsg: string): Promise<void> {
        dialog.showMessageBoxSync({
            message: errorMsg,
            type: 'error',
            title: `${rolError} error`
        });
    }
    public static async openLoadDiskDialog(parent?: BrowserWindow): Promise<{ name: string, pass: string } | null> {
        return new Promise(resolve => {
            if (!Dialogs.dialogOpened) {
                Dialogs.dialogOpened = true;
                let loaderWindow = new BrowserWindow({
                    show: false,
                    darkTheme: true,
                    minimizable: false,
                    maximizable: false,
                    width: 550,
                    height: 200,
                    parent,
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false
                    }
                });
                loaderWindow.setMenu(null);
                loaderWindow.loadFile(loaderHtml);
                loaderWindow.once('ready-to-show', () => loaderWindow.show());
                loaderWindow.webContents.once('dom-ready', () => {
                    loaderWindow.webContents.send('send-info', Disks.getNotLoadedDisks());
                });
                ipcMain.on('load-disk', (ev, name, pass) => {
                    loaderWindow.destroy();
                    Dialogs.dialogOpened = false;
                    resolve({ name, pass });
                });
                loaderWindow.on('close', () => {
                    Dialogs.dialogOpened = false;
                    resolve(null);
                });
            } else {
                resolve(null);
            }
        });
    }
    public static async openAddDiskDialog(parent?: BrowserWindow): Promise<{ name: string, pass: string } | null> {
        return new Promise(resolve => {
            if (!Dialogs.dialogOpened) {
                Dialogs.dialogOpened = true;
                let addDiskWindow = new BrowserWindow({
                    show: false,
                    darkTheme: true,
                    resizable: false,
                    minimizable: false,
                    maximizable: false,
                    width: 750,
                    height: 250,
                    parent,
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false
                    }
                });
                addDiskWindow.setMenu(null);
                addDiskWindow.loadFile(addDiskHtml);
                addDiskWindow.once('ready-to-show', () => addDiskWindow.show());
                addDiskWindow.webContents.once('dom-ready', () => {
                    addDiskWindow.webContents.send('send-info', Disks.getAllDisks());
                });
                ipcMain.on('create-disk', (ev, name, pass) => {
                    addDiskWindow.destroy();
                    Dialogs.dialogOpened = false;
                    resolve({ name, pass });
                });
                addDiskWindow.on('close', () => {
                    Dialogs.dialogOpened = false;
                    resolve(null);
                });
            } else {
                resolve(null);
            }
        });
    }
    public static async openRemoveDiskDialog(parent?: BrowserWindow): Promise<{ selected: string, pass: string } | null> {
        return new Promise(resolve => {
            if (!Dialogs.dialogOpened) {
                Dialogs.dialogOpened = true;
                let removeDiskWindow = new BrowserWindow({
                    show: false,
                    darkTheme: true,
                    minimizable: false,
                    maximizable: false,
                    width: 550,
                    height: 200,
                    parent,
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false
                    }
                });
                removeDiskWindow.setMenu(null);
                removeDiskWindow.loadFile(removeDiskHtml);
                removeDiskWindow.once('ready-to-show', () => removeDiskWindow.show());
                removeDiskWindow.webContents.once('dom-ready', () => {
                    removeDiskWindow.webContents.send('send-info', Disks.getAllDisks());
                });
                ipcMain.on('remove-disk', (ev, selected, pass) => {
                    removeDiskWindow.destroy();
                    Dialogs.dialogOpened = false;
                    resolve({ selected, pass });
                });
                removeDiskWindow.on('close', () => {
                    Dialogs.dialogOpened = false;
                    resolve(null);
                });
            } else {
                resolve(null);
            }
        });
    }
}
export default Dialogs;