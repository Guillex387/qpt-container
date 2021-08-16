import { ipcRenderer } from 'electron';
import { loadDisk, loadFile, loadPreviewer, activeList, loadFolder } from './components';
import DiskCtrl from './diskController';
let blobUrlPreview: string | undefined = undefined;
let makingFolder = false;
export async function newFiles(originPath: string): Promise<void> {
    let files = DiskCtrl.importFiles(originPath);
    files.forEach(file => {
        loadFile(file, `${originPath}/${file}`);
    });
}
export function exportFile(file: string): void {
    DiskCtrl.exportFile(file);
}
async function newFolder(folderPath: string): Promise<void> {
    let pathSegments = folderPath.split('/');
    let name = pathSegments.pop();
    let path = '';
    pathSegments.forEach((segment, index) => {
        if (index === (pathSegments.length - 1)) {
            path += segment;
        } else {
            path += `${segment}/`;
        }
    });
    let created: boolean = DiskCtrl.createFolder(path, name);
    if (created) {
        loadFolder({ type: 'folder', name: name, content: [] }, folderPath);
    }
}
async function showMessageBox(msg: string): Promise<boolean> {
    return (
        ipcRenderer.sendSync('message-box-confirm', msg)
    );
}
export function makerKeyPress(ev: KeyboardEvent) {
    let element = <HTMLInputElement>document.getElementById('makerInput0');
    let container = element.parentElement;
    switch (ev.key) {
        case 'Enter':
            if (element.value.includes('"') || element.value.includes('\'')) return;
            let folderPath = `${element.parentElement.parentElement.parentElement.id}/${element.value}`;
            element.removeEventListener('keydown', makerKeyPress);
            container.innerHTML = '';
            container.remove();
            newFolder(folderPath);
            makingFolder = false;
            break;
        case 'Escape':
            element.removeEventListener('keydown', makerKeyPress);
            container.innerHTML = '';
            container.remove();
            makingFolder = false;
            break;
    }
}
export const folderMaker = (path: string) => {
    if (!makingFolder) {
        let mainNode = document.getElementById(path);
        let ulNode = mainNode.children[1];
        if (ulNode.className === 'nested') {
            activeList(mainNode.children[0]);
        }
        ulNode.innerHTML += `
        <li class="folderMkr">
            <img src="./img/carpeta.svg">
            <input type="text" id="makerInput0">
        </li>
        `;
        (<HTMLInputElement>document.getElementById('makerInput0')).addEventListener('keydown', makerKeyPress);
        makingFolder = true;
    }
};
export async function rmFolder(path: string): Promise<void> {
    let sure = await showMessageBox('Are you sure?');
    if (sure) {
        let removed = DiskCtrl.rmFolder(path);
        if (removed) {
            deleteFronPath(path);
        }
    }
}
export async function rmFile(path: string): Promise<void> {
    let sure = await showMessageBox('Are you sure?');
    if (sure) {
        let removed = DiskCtrl.rmFile(path);
        if (removed) {
            deleteFronPath(path);
        }
    }
}
function deleteFronPath(path: string): void {
    let target = document.getElementById(path);
    let parentElement = target.parentElement;
    parentElement.removeChild(target);
}
function createBlobPreview(blob: Blob): string {
    if (blobUrlPreview) {
        URL.revokeObjectURL(blobUrlPreview);
        blobUrlPreview = undefined;
    }
    blobUrlPreview = URL.createObjectURL(blob);
    return blobUrlPreview;
}
export async function preview(filePath: string): Promise<void> {
    let segments = filePath.split('/');
    let name = segments[segments.length - 1];
    let file = await DiskCtrl.getFileContent(filePath);
    if (file !== null) {
        let blobUrl = createBlobPreview(file.data);
        loadPreviewer(name, blobUrl, file.mimeType);
    }
}
ipcRenderer.on('new-disk', (ev, newDisk: { name: string, content: any }) => {
    loadDisk(newDisk.name, newDisk.content);
});
ipcRenderer.on('rm-disk', (ev, delDiskName) => {
    let target = document.getElementById(delDiskName);
    let parentNode = target.parentElement;
    parentNode.removeChild(target);
});