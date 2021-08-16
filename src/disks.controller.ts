import * as fs from 'fs';
import Disk from './lib/disk';
import errors from './errors';
import { controllerPath, disksFolder, dataFolder } from './config';

class DisksList {
    public static init() {
        if (!fs.existsSync(dataFolder)) {
            fs.mkdirSync(dataFolder);
            if (!fs.existsSync(controllerPath)) {
                fs.writeFileSync(controllerPath, '[]');
                if (!fs.existsSync(disksFolder)) {
                    fs.mkdirSync(disksFolder);
                }
            }
        }
        return new DisksList();
    }
    private constructor() { }

    public get avaliables(): string[] {
        let json = fs.readFileSync(controllerPath, { encoding: 'utf-8' });
        return JSON.parse(json);
    }
    public set avaliables(value: string[]) {
        let json = JSON.stringify(value);
        fs.writeFileSync(controllerPath, json, { encoding: 'utf-8' });
    }
}
export default class Disks {
    private static loaded: Disk[] = [];
    private static diskList = DisksList.init();
    public static get avaliables() {
        return Disks.diskList.avaliables;
    }
    public static load(name: string, pass: string): void {
        if (!Disks.diskList.avaliables.includes(name)) {
            throw errors.disk[0];
        } else if (Disks.isLoaded(name)) return;
        let disk = Disk.select(name, pass);
        Disks.loaded.push(disk);
    }
    public static createDisk(name: string, pass: string): void {
        if (Disks.diskList.avaliables.includes(name))
            throw errors.disk[1];
        let disk = Disk.create(name, pass);
        Disks.diskList.avaliables = [...Disks.diskList.avaliables, disk.name];
        Disks.loaded.push(disk);
    }
    public static isLoaded(name: string): boolean {
        let index = Disks.loaded.findIndex(disk => disk.name === name);
        return (index !== -1);
    }
    public static getNotLoadedDisks(): string[] {
        let names: string[] = Disks.diskList.avaliables;
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
                let _avaliables: string[] = Disks.diskList.avaliables;
                let diskIndex = _avaliables.findIndex(diskName => diskName === name);
                if (diskIndex === -1) return;
                _avaliables.splice(diskIndex, 1);
                Disks.diskList.avaliables = _avaliables;
            } else {
                throw errors.encrypter[0];
            }
            return;
        }
        let disk = Disk.select(name, pass);
        disk.remove();
        let _avaliables: string[] = Disks.diskList.avaliables;
        let diskIndex = _avaliables.findIndex(diskName => diskName === name);
        if (diskIndex === -1) return;
        _avaliables.splice(diskIndex, 1);
        Disks.diskList.avaliables = _avaliables;
    }
    public static async exportDisk(name: string, pass: string, path: string) {
        let disk = Disk.select(name, pass);
        try {
            fs.writeFileSync(path, await disk.export());
        } catch (_) {
            throw errors.exporter[1];
        }
    }
    public static importDisk(name: string, pass: string, buffer: Buffer) {
        if (Disks.diskList.avaliables.includes(name))
            throw errors.disk[1];
        let disk = Disk.import(name, buffer, pass);
        let disksList: string[] = JSON.parse(fs.readFileSync(controllerPath, { encoding: 'utf-8' }));
        disksList.push(disk.name);
        fs.writeFileSync(controllerPath, JSON.stringify(disksList), 'utf-8');
        Disks.diskList.avaliables = disksList;
        Disks.loaded.push(disk);
    }
}