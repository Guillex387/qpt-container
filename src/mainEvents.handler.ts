import { IpcMainEvent } from "electron/main";
import Dialogs from './dialogs';
import Disks from './disks.controller';
import { handleError } from './errors';
import * as fs from 'fs';

const newFile = async (ev: IpcMainEvent, originPath: string) => {
    let files = await Dialogs.openFileDialog();
    let succesfulyCreated: string[] = [];
    for (const file of files) {
        await handleError(async () => {
            let path = originPath.split('/');
            let diskName = path.shift();
            await Disks.getDisk(diskName).addFile(path, { name: file.name, mimeType: file.mimeType, content: file.content });
            succesfulyCreated.push(file.name);
        }, (rolErr, msg) => {
            Dialogs.openErrorDialog(rolErr, msg);
        });
    }
    ev.returnValue = succesfulyCreated;
};
const newFolder = async (ev: IpcMainEvent, originPath: string, name: string) => {
    await handleError(() => {
        let path = originPath.split('/');
        let diskName = path.shift();
        Disks.getDisk(diskName).addFolder(path, name);
        ev.returnValue = true;
    }, (rolErr, msg) => {
        ev.returnValue = false;
        Dialogs.openErrorDialog(rolErr, msg);
    });
};
const getFile = async (ev: IpcMainEvent, filePath: string) => {
    await handleError(async () => {
        let path = filePath.split('/');
        let diskName = path.shift();
        const { data, mimeType } = await Disks.getDisk(diskName).getFileContent(path);
        ev.returnValue = [Uint8Array.from(data), mimeType];
    }, (rolErr, msg) => {
        ev.returnValue = null;
        Dialogs.openErrorDialog(rolErr, msg);
    });
};
const rmFile = async (ev, filePath: string) => {
    await handleError(async () => {
        let path = filePath.split('/');
        let diskName = path.shift();
        await Disks.getDisk(diskName).rmFile(path);
        ev.returnValue = true;
    }, (rolErr, msg) => {
        ev.returnValue = false;
        Dialogs.openErrorDialog(rolErr, msg);
    });
};
const rmFolder = async (ev, folderPath: string) => {
    await handleError(async () => {
        let path = folderPath.split('/');
        let diskName = path.shift();
        await Disks.getDisk(diskName).rmFolder(path);
        ev.returnValue = true;
    }, (rolErr, msg) => {
        ev.returnValue = false;
        Dialogs.openErrorDialog(rolErr, msg);
    });
};
const msgBoxConfirm = async (ev, msg: string) => {
    let accepted = await Dialogs.openQuestionDialog(msg);
    ev.returnValue = accepted;
};
const exportFile = async (ev, file: string) => {
    let segments = file.split('/');
    let fileName = segments[segments.length - 1];
    let selectedPath = await Dialogs.openExportDialog(fileName);
    if (selectedPath !== undefined) {
        let savePath: string = selectedPath;
        await handleError(async () => {
            let filePath = file.split('/');
            let diskName = filePath.shift();
            let { data } = await Disks.getDisk(diskName).getFileContent(filePath);
            fs.writeFileSync(savePath, data);
        }, (rolErr, msg) => {
            Dialogs.openErrorDialog(rolErr, msg);
        });
    }
};

export default {
    newFile,
    newFolder,
    getFile,
    rmFile,
    rmFolder,
    msgBoxConfirm,
    exportFile
};