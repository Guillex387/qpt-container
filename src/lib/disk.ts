import * as path from "path";
import * as fs from "fs";
import Container from "./container";
import Encryptor from "./crypter";
import errors from "../errors";
import Compressor from "./compress";
import { controllerPath, disksFolder, dataFolder } from '../config';
interface FileI {
    type: "file";
    name: string;
    mimeType: string;
    content: string;
}
interface FolderI {
    type: "folder";
    name: string;
    content: (FileI | FolderI)[];
}
export interface Disk {
    name: string;
    key: string;
    content: (FileI | FolderI)[];
    container: Container;
}
export default class Disks {
    private static loaded: Disk[] = [];
    private static availables: string[] = [];
    public static async init(): Promise<void> {
        if (!fs.existsSync(dataFolder)) {
            fs.mkdirSync(dataFolder);
            if (!fs.existsSync(controllerPath)) {
                Disks.createDiskControllerFile();
                if (!fs.existsSync(disksFolder)) {
                    fs.mkdirSync(disksFolder);
                }
            }
            return;
        }
        Disks.availables = JSON.parse(fs.readFileSync(controllerPath, { encoding: 'utf-8' }));
        return;
    }
    public static createDiskControllerFile(): void {
        fs.writeFileSync(controllerPath, Buffer.from('[]', 'utf-8'));
    }
    public static resetProgramContent(): void {
        Disks.loaded.forEach(disk => {
            disk.container.closeContainer();
        });
        Disks.loaded = [];
        Disks.availables = [];
        Disks.createDiskControllerFile();
        fs.rmdirSync(disksFolder, { recursive: true });
        fs.mkdirSync(disksFolder);
    }
    public static save(): void {
        Disks.loaded.forEach(disk => {
            let map = path.join(disksFolder, `${disk.name}.map`);
            let binContent = Buffer.from(JSON.stringify(disk.content), 'utf-8');
            let data = Encryptor.encrypt(binContent, disk.key);
            fs.writeFileSync(map, data);
        });
    }
    public static load(diskName: string, pass: string): void {
        if (!Disks.getAllDisks().includes(diskName)) {
            throw errors.disk[0];
        }
        let container = Container.select(diskName);
        let dataEnc = fs.readFileSync(path.join(disksFolder, `${diskName}.map`));
        let dataDec = Encryptor.decrypt(dataEnc, pass);
        let content = JSON.parse(dataDec.toString('utf-8'));
        Disks.loaded.push({
            name: diskName,
            container,
            content,
            key: pass
        });
    }
    public static createDisk(name: string, pass: string): void {
        if (Disks.getAllDisks().includes(name)) {
            throw errors.disk[1];
        }
        let container = Container.create(name);
        let newDisk: Disk = {
            name: name,
            container: container,
            key: pass,
            content: []
        };
        let map = Encryptor.encrypt(Buffer.from('[]', 'utf-8'), pass);
        fs.writeFileSync(path.join(disksFolder, `${name}.map`), map);
        let disksList: string[] = JSON.parse(fs.readFileSync(controllerPath, { encoding: 'utf-8' }));
        disksList.push(newDisk.name);
        fs.writeFileSync(controllerPath, Buffer.from(JSON.stringify(disksList), 'utf-8'));
        Disks.availables = disksList;
        Disks.loaded.push(newDisk);
    }
    public static diskLoaded(name: string): boolean {
        let out = false;
        Disks.loaded.forEach((e) => {
            if (e.name == name) {
                out = true;
                return null;
            }
        });
        return out;
    }
    public static pathExist(path: string): boolean {
        let segments: string[] = path.split("/");
        let level: number = 1;
        const explore = (array: (FileI | FolderI)[], name: string): FileI | FolderI | null => {
            let out: FileI | FolderI | null = null;
            array.forEach((e) => {
                if (e.name == name && level == segments.length - 1) {
                    out = e;
                    return;
                } else if (e.name == name && e.type == "folder" && e.content.length > 0) {
                    level += 1;
                    out = explore(e.content, segments[level]);
                    return;
                }
            });
            return out;
        };
        let res = explore(Disks.getDiskObj(segments[0]).content, segments[level]);
        if (res === null) {
            return false;
        }
        return true;
    }
    public static getAllDisks(): string[] {
        return Disks.availables;
    }
    public static getNotLoadedDisks(): string[] {
        let names: string[] = Disks.availables;
        Disks.loaded.forEach(e => {
            let index = names.indexOf(e.name);
            if (index !== -1) {
                names.splice(index, 1);
            }
        });
        return names;
    }
    public static getDiskObj(name: string): Disk {
        let out: Disk | null = null;
        Disks.loaded.forEach((e) => {
            if (e.name == name) {
                out = e;
                return;
            }
        });
        if (out === null) {
            throw errors.disk[0];
        }
        return out;
    }
    public static async getFileContent(path: string): Promise<{ data: Buffer, mimeType: string }> {
        let segments: string[] = path.split("/");
        let level: number = 1;
        const explore = (array: (FileI | FolderI)[], name: string): FileI | null => {
            let out: FileI | null = null;
            array.forEach((e) => {
                if (e.name == name && e.type == "file" && level == segments.length - 1) {
                    out = e;
                    return;
                } else if (e.name == name && e.type == "folder" && e.content.length > 0) {
                    level += 1;
                    out = explore(e.content, segments[level]);
                    return;
                }
            });
            return out;
        };
        let disk = Disks.getDiskObj(segments[0]);
        let res = explore(disk.content, segments[level]);
        if (res === null) {
            throw errors.disk[2];
        }
        return {
            mimeType: res.mimeType,
            data: Compressor.deCompress(Encryptor.decrypt(await disk.container.getContent(res.content), disk.key))
        };
    }
    public static getFolder(path: string): FolderI {
        let segments: string[] = path.split("/");
        let level: number = 1;
        const explore = (array: (FileI | FolderI)[], name: string): FolderI | null => {
            let out: FolderI | null = null;
            array.forEach((e) => {
                if (e.name == name && e.type == "folder" && level == segments.length - 1) {
                    out = e;
                    return;
                } else if (e.name == name && e.type == "folder" && e.content.length > 0) {
                    level += 1;
                    out = explore(e.content, segments[level]);
                    return;
                }
            });
            return out;
        };
        let res = explore(Disks.getDiskObj(segments[0]).content, segments[level]);
        if (res === null) {
            throw errors.disk[3];
        }
        return res;
    }
    public static rmDisk(name: string, pass: string): void {
        let exists = false;
        Disks.loaded.forEach((disk, index) => {
            if (disk.name === name) {
                Disks.loaded.splice(index, 1);
            }
        });
        let disk = Disks.getDiskObj(name);
        if (!exists) {
            throw errors.disk[0];
        }
        let basePath = path.join(disksFolder, name);
        let map = basePath + '.map';
        let router = basePath + '.coo';
        let container = basePath + '.bin';
        Encryptor.decrypt(fs.readFileSync(map), pass);
        let disksList: string[] = JSON.parse(fs.readFileSync(controllerPath, { encoding: 'utf-8' }));
        let index = disksList.indexOf(name);
        disksList.splice(index, 1);
        Disks.availables = disksList;
        fs.writeFileSync(controllerPath, Buffer.from(JSON.stringify(disksList), 'utf-8'));
        disk.container.closeContainer();
        fs.unlinkSync(map);
        fs.unlinkSync(router);
        fs.unlinkSync(container);
    }
    public static async rmFile(path: string): Promise<void> {
        let segments: string[] = path.split("/");
        if (!Disks.diskLoaded(segments[0])) {
            throw errors.disk[0];
        }
        let level: number = 1;
        let address = '';
        const explore = (array: (FileI | FolderI)[], name: string): null | (FileI | FolderI)[] => {
            let out: null | (FileI | FolderI)[] = null;
            array.forEach((e, i) => {
                if (e.name == name && e.type == "file" && level == segments.length - 1) {
                    let arrCopy = array;
                    arrCopy.splice(i, 1);
                    out = arrCopy;
                    address = e.content;
                    return;
                } else if (e.name == name && e.type == "folder" && e.content.length > 0) {
                    level += 1;
                    let arrCopy = array;
                    let res = explore(e.content, segments[level]);
                    if (res == null) {
                        return;
                    } else {
                        arrCopy[i].content = res;
                        out = arrCopy;
                    }
                    return;
                }
            });
            return out;
        };
        let disk = Disks.getDiskObj(segments[0]);
        let res = explore(disk.content, segments[level]);
        if (res === null) {
            throw errors.disk[4];
        }
        await disk.container.rmContent(address);
        let out = false;
        Disks.loaded.forEach((e, i) => {
            if (e.name == segments[0]) {
                if (res == null) {
                    return;
                } else {
                    Disks.loaded[i].content = res;
                    Disks.save();
                    out = true;
                    return;
                }
            }
        });
        if (!out) {
            throw errors.disk[4];
        }
    }
    public static async rmFolder(path: string): Promise<void> {
        let segments: string[] = path.split("/");
        if (!Disks.diskLoaded(segments[0])) {
            throw errors.disk[0];
        }
        let level: number = 1;
        const explore = (array: (FileI | FolderI)[], name: string): null | (FileI | FolderI)[] => {
            let out: null | (FileI | FolderI)[] = null;
            array.forEach((e, i) => {
                if (e.name == name && e.type == "folder" && level == segments.length - 1) {
                    let arrCopy = array;
                    arrCopy.splice(i, 1);
                    out = arrCopy;
                    return;
                } else if (e.name == name && e.type == "folder" && e.content.length > 0) {
                    level += 1;
                    let arrCopy = array;
                    let res = explore(e.content, segments[level]);
                    if (res == null) {
                        return;
                    } else {
                        arrCopy[i].content = res;
                        out = arrCopy;
                    }
                    return;
                }
            });
            return out;
        };
        const getFilesAddress = (content: (FileI | FolderI)[]): string[] => {
            let addressList: string[] = [];
            content.forEach(el => {
                if (el.type == 'file') {
                    addressList.push(el.content);
                } else {
                    let items = getFilesAddress(el.content);
                    addressList.push(...items);
                }
            });
            return addressList;
        };
        let disk = Disks.getDiskObj(segments[0]);
        let errorDisk8 = false;
        let filesAddress = getFilesAddress(Disks.getFolder(path).content);
        for (let i = 0; i < filesAddress.length; i++) {
            try {
                await disk.container.rmContent(filesAddress[i]);
            } catch (error) {
                errorDisk8 = true;
            }
        }
        let res = explore(disk.content, segments[level]);
        let out = false;
        Disks.loaded.forEach((e, i) => {
            if (e.name == segments[0]) {
                if (res == null) {
                    return;
                } else {
                    Disks.loaded[i].content = res;
                    Disks.save();
                    out = true;
                    return;
                }
            }
        });
        if (errorDisk8) {
            throw errors.disk[8];
        }
        if (!out) {
            throw errors.disk[5];
        }
    }
    public static async addFile(originpath: string, file: { name: string, mimeType: string, content: Buffer }): Promise<void> {
        let segments: string[] = originpath.split("/");
        if (!Disks.diskLoaded(segments[0])) {
            throw errors.disk[0];
        }
        let exist = Disks.pathExist(`${originpath}/${file.name}`);
        if (exist) {
            throw errors.disk[2];
        }
        let level: number = 1;
        let disk = Disks.getDiskObj(segments[0]);
        let data = Encryptor.encrypt(Compressor.compress(file.content), disk.key);
        let address = await disk.container.addContent(data);
        const fileObj: FileI = {
            type: 'file',
            name: file.name,
            mimeType: file.mimeType,
            content: address
        };
        const explore = (array: (FileI | FolderI)[], name: string): null | (FileI | FolderI)[] => {
            let out: null | (FileI | FolderI)[] = null;
            array.forEach((e, i) => {
                if (e.name == name && e.type == "folder" && level == segments.length - 1) {
                    let arrCopy: any = array;
                    arrCopy[i].content.push(fileObj);
                    out = arrCopy;
                    return;
                } else if (e.name == name && e.type == "folder" && e.content.length > 0) {
                    level += 1;
                    let arrCopy = array;
                    let res = explore(e.content, segments[level]);
                    if (res == null) {
                        return;
                    } else {
                        arrCopy[i].content = res;
                        out = arrCopy;
                    }
                    return;
                }
            });
            return out;
        };
        if (segments.length === 1) {
            try {
                Disks.loaded[Disks.loaded.indexOf(disk)].content.push(fileObj);
            } catch (error) {
                throw errors.disk[4];
            }
        } else {
            let out = false;
            let res = explore(disk.content, segments[level]);
            Disks.loaded.forEach((e, i) => {
                if (e.name == segments[0]) {
                    if (res == null) {
                        return;
                    } else {
                        Disks.loaded[i].content = res;
                        Disks.save();
                        out = true;
                        return;
                    }
                }
            });
            if (!out) {
                await disk.container.rmContent(address);
                throw errors.disk[4];
            }
        }
        return;
    }
    public static addFolder(originpath: string, folderName: string): void {
        let segments: string[] = originpath.split("/");
        if (!Disks.diskLoaded(segments[0])) {
            throw errors.disk[0];
        }
        if (Disks.pathExist(`${originpath}/${folderName}`)) {
            throw errors.disk[7];
        }
        let level: number = 1;
        let disk = Disks.getDiskObj(segments[0]);
        let folderObj: FolderI = { name: folderName, type: 'folder', content: [] };
        const explore = (array: (FileI | FolderI)[], name: string): null | (FileI | FolderI)[] => {
            let out: null | (FileI | FolderI)[] = null;
            array.forEach((e, i) => {
                if (e.name == name && e.type == "folder" && level == segments.length - 1) {
                    let arrCopy: any = array;
                    arrCopy[i].content.push(folderObj);
                    out = arrCopy;
                    return;
                } else if (e.name == name && e.type == "folder" && e.content.length > 0) {
                    level += 1;
                    let arrCopy = array;
                    let res = explore(e.content, segments[level]);
                    if (res == null) {
                        return;
                    } else {
                        arrCopy[i].content = res;
                        out = arrCopy;
                    }
                    return;
                }
            });
            return out;
        };
        if (segments.length === 1) {
            try {
                Disks.loaded[Disks.loaded.indexOf(disk)].content.push(folderObj);
            } catch (error) {
                throw errors.disk[4];
            }
        } else {
            let out = false;
            let res = explore(disk.content, segments[level]);
            Disks.loaded.forEach((e, i) => {
                if (e.name == segments[0]) {
                    if (res == null) {
                        return;
                    } else {
                        Disks.loaded[i].content = res;
                        Disks.save();
                        out = true;
                        return;
                    }
                }
            });
            if (!out) {
                throw errors.disk[4];
            }
        }
        return;
    }
}