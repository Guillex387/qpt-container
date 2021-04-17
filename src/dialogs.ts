import { dialog, BrowserWindow, ipcMain } from 'electron';
import Disks from './disk';
import mime from 'mime-types';
import fs from 'fs';
import path from 'path';
const addDiskHtml = path.join(__dirname, '..', 'views', 'addDisk.html');
const loaderHtml = path.join(__dirname, '..', 'views', 'loader.html');
const removeDiskHtml = path.join(__dirname, '..', 'views', 'removeDisk.html');
let addDiskWindow: BrowserWindow;
let loaderWindow: BrowserWindow;
let removeDiskWindow: BrowserWindow;
let loadcb: (diskName: string, pass: string) => void = () => null;
let addDcb: (diskName: string, pass: string) => void = () => null;
let remvcb: (diskName: string, pass: string) => void = () => null;
ipcMain.on('load-disk', (ev, name, pass) => {
    loaderWindow.close();
    loadcb(name, pass);
});
ipcMain.on('create-disk', (ev, diskName, pass) => {
    addDiskWindow.close();
    addDcb(diskName, pass);
});
ipcMain.on('remove-disk', (ev, selected, pass) => {
    removeDiskWindow.close();
    remvcb(selected, pass);
});
class Dialogs {
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
            title: 'QPT container',
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
    public static async openLoadDiskDialog(callBack: (diskName: string, pass: string) => void): Promise<void> {
        let execCallBack = false;
        loaderWindow = new BrowserWindow({
            show: false,
            darkTheme: true,
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
        loadcb = (name, pass) => {
            execCallBack = true;
            callBack(name, pass);
        };
        loaderWindow.on('close', () => {
            if (!execCallBack) {
                callBack('', '');
            }
        });
    }
    public static async openAddDiskDialog(callBack: (name: string, pass: string) => void): Promise<void> {
        let execCallBack = false;
        addDiskWindow = new BrowserWindow({
            show: false,
            darkTheme: true,
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
        addDcb = (name, pass) => {
            execCallBack = true;
            callBack(name, pass);
        }
        addDiskWindow.on('close', () => {
            if (!execCallBack) {
                callBack('', '');
            }
        });
    }
    public static async openRemoveDiskDialog(callBack: (selected: string, pass: string) => void): Promise<void> {
        let executedCallBack: boolean = false;
        removeDiskWindow = new BrowserWindow({
            show: false,
            darkTheme: true,
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
        remvcb = (name, pass) => {
            executedCallBack = true;
            callBack(name, pass);
        }
        removeDiskWindow.on('close', () => {
            if (!executedCallBack) {
                callBack('', '');
            }
        });
    }
}
export default Dialogs;