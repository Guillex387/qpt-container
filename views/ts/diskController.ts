import { ipcRenderer } from 'electron';
export default class DiskController {
    public static createFolder(originpath: string, folderName: string): boolean {
        let created: boolean = ipcRenderer.sendSync('new-folder', originpath, folderName);
        return created;
    }
    public static importFiles(originPath: string): string[] {
        let importedFiles: string[] = ipcRenderer.sendSync('new-file', originPath);
        return importedFiles;
    }
    public static async getFileContent(filePath: string): Promise<{ data: Blob, mimeType: string } | null> {
        let rawResponse = ipcRenderer.sendSync('get-file', filePath);
        if (rawResponse === null) {
            return null;
        }
        let [byteArray, mimeType]: [Uint8Array, string] = rawResponse;
        let data = new Blob([byteArray], { type: mimeType });
        return { data, mimeType };
    }
    public static async exportFile(file: string): Promise<void> {
        ipcRenderer.send('export-file', file);
    }
    public static rmFile(filePath: string): boolean {
        let removed: boolean = ipcRenderer.sendSync('remove-file', filePath);
        return removed;
    }
    public static rmFolder(folderPath: string): boolean {
        let removed: boolean = ipcRenderer.sendSync('remove-folder', folderPath);
        return removed;
    }
}