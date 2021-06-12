import * as fs from "fs";
import Disk from "./lib/disk";
import errors from "./errors";
import { controllerPath, disksFolder, dataFolder } from './config';
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
    public static load(name: string, pass: string): void {
        if (!Disks.getAllDisks().includes(name)) {
            throw errors.disk[0];
        } else if (Disks.isLoaded(name)) return;
        let disk = Disk.select(name, pass);
        Disks.loaded.push(disk);
    }
    public static createDisk(name: string, pass: string): void {
        if (Disks.getAllDisks().includes(name)) {
            throw errors.disk[1];
        }
        let disk = Disk.create(name, pass);
        let disksList: string[] = JSON.parse(fs.readFileSync(controllerPath, { encoding: 'utf-8' }));
        disksList.push(name);
        fs.writeFileSync(controllerPath, Buffer.from(JSON.stringify(disksList), 'utf-8'));
        Disks.availables = disksList;
        Disks.loaded.push(disk);
    }
    public static isLoaded(name: string): boolean {
        let index = Disks.loaded.findIndex(disk => disk.name === name);
        return (index !== -1);
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
    public static getDisk(name: string): Disk {
        let disk = Disks.loaded.find(disk => disk.name === name);
        if (disk) return disk;
        throw errors.disk[0];
    }
    public static rmDisk(name: string, pass: string): void {
        let index = Disks.loaded.findIndex(disk => disk.name === name);
        if (index !== -1) {
            let disk = Disks.loaded[index];
            let verified = disk.verify(pass);
            if (verified) {
                Disks.loaded.splice(index, 1);
                disk.remove();
                let disksList: string[] = JSON.parse(fs.readFileSync(controllerPath, { encoding: 'utf-8' }));
                let controllerIndex = disksList.findIndex(diskName => diskName === name);
                if (controllerIndex !== -1) disksList.splice(controllerIndex, 1);
                fs.writeFileSync(controllerPath, Buffer.from(JSON.stringify(disksList), 'utf-8'));
                Disks.availables = disksList;
            } else {
                throw errors.encrypter[0];
            }
            return;
        }
        let disk = Disk.select(name, pass);
        disk.remove();
        let disksList: string[] = JSON.parse(fs.readFileSync(controllerPath, { encoding: 'utf-8' }));
        let controllerIndex = disksList.findIndex(diskName => diskName === name);
        if (controllerIndex !== -1) disksList.splice(controllerIndex, 1);
        fs.writeFileSync(controllerPath, Buffer.from(JSON.stringify(disksList), 'utf-8'));
        Disks.availables = disksList;
        return;
    }
}