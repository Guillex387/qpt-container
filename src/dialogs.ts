import { dialog, BrowserWindow, ipcMain } from 'electron';
import Disks from './disks.controller';
import { appIcon, isLinux } from './config';
import * as mime from 'mime-types';
import * as fs from 'fs';
import * as path from 'path';
const addDiskHtml = path.join(__dirname, '..', 'views', 'addDisk.html');
const loaderHtml = path.join(__dirname, '..', 'views', 'loader.html');
const removeDiskHtml = path.join(__dirname, '..', 'views', 'removeDisk.html');
const exportDiskHtml = path.join(__dirname, '..', 'views', 'exportDisk.html');
const importDiskHtml = path.join(__dirname, '..', 'views', 'importDisk.html');
type DiskDialogs = 'add' | 'load' | 'remove' | 'export' | 'import';
class Dialogs {
    private static dialogOpened: boolean = false;
    public static async openFileDialog(singleFile: boolean = false, titleMsg: string = 'Open file'): Promise<{
        name: string;
        mimeType: string;
        content: Buffer;
    }[]> {
        let paths = dialog.showOpenDialogSync({
            properties: ['openFile', singleFile ? null : 'multiSelections'],
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
    public static async openExportDialog(defaultFile: string = '', staticExtension: boolean = false, buttonMsg: string = 'Export'): Promise<string | undefined> {
        let segments = defaultFile.split('.');
        let extension = segments[segments.length - 1];
        return dialog.showSaveDialogSync({
            title: 'Export file',
            buttonLabel: buttonMsg,
            defaultPath: defaultFile,
            filters: staticExtension ? [{ name: 'Static extension', extensions: [extension] }] : [
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
    public static openDiskDialog(html: DiskDialogs, size: [number, number] = [600, 200]): Promise<{ name: string, pass: string } | null> {
        const htmls = {
            add: addDiskHtml,
            load: loaderHtml,
            remove: removeDiskHtml,
            export: exportDiskHtml,
            import: importDiskHtml
        };
        const htmlFile = htmls[html];
        return new Promise(resolve => {
            if (!Dialogs.dialogOpened) {
                Dialogs.dialogOpened = true;
                let removeDiskWindow = new BrowserWindow({
                    show: false,
                    darkTheme: true,
                    minimizable: false,
                    maximizable: false,
                    width: size[0],
                    height: size[1],
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false
                    }
                });
                removeDiskWindow.setMenu(null);
                isLinux && removeDiskWindow.setIcon(appIcon);
                removeDiskWindow.loadFile(htmlFile);
                removeDiskWindow.once('ready-to-show', () => removeDiskWindow.show());
                removeDiskWindow.webContents.once('dom-ready', () => {
                    removeDiskWindow.webContents.send('send-info', Disks.avaliables);
                });
                ipcMain.on('data', (ev, name, pass) => {
                    removeDiskWindow.destroy();
                    Dialogs.dialogOpened = false;
                    resolve({ name, pass });
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