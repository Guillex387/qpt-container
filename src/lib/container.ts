import * as fs from 'fs';
import * as path from 'path';
import errors from '../errors';
import { disksFolder } from '../config';
export default class Container {
    private static formatPath(name: string): [string, string] {
        let basePath = path.join(disksFolder, name);
        return [basePath + '.coo', basePath + '.bin'];
    }
    public static create(name: string): Container {
        let [addressPh, containerPh] = Container.formatPath(name);
        if (fs.existsSync(containerPh)) {
            throw errors.container[0];
        }
        fs.writeFileSync(containerPh, Buffer.from('', 'ascii'));
        fs.writeFileSync(addressPh, Buffer.from('[]', 'utf-8'));
        return new Container(containerPh, addressPh);
    }
    public static select(name: string): Container {
        let [addressPh, containerPh] = Container.formatPath(name);
        if (!fs.existsSync(containerPh)) {
            throw errors.container[1];
        }
        return new Container(containerPh, addressPh);
    }
    public containerPath: string;
    public freeSpacesPath: string;
    private freeSpacesList: string[];
    private fd: number;
    private addFreeSpace(...s: string[]): void {
        this.freeSpacesList.push(...s);
        this.freeSpacesList.sort((a, b) => {
            let locsA = Container.addressParseStr(a);
            let locsB = Container.addressParseStr(b);
            let sizeA = (locsA[1] - locsA[0]) + 1;
            let sizeB = (locsB[1] - locsB[0]) + 1;
            return sizeB - sizeA;
        });
    }
    private saveFreeSpaces(): void {
        fs.writeFileSync(this.freeSpacesPath, JSON.stringify(this.freeSpacesList), { encoding: 'utf-8' });
    }
    private static addressParseStr(str: string): [number, number] {
        let buf = Buffer.from(str, 'base64');
        if (buf.length !== 16) throw 'Format error';
        let firstByte = Number(buf.readBigUInt64BE(0));
        let lastByte = Number(buf.readBigUInt64BE(8));
        return [firstByte, lastByte];
    }
    private static addressParseLocs(locs: [number, number]): string {
        let buf = Buffer.alloc(16);
        buf.writeBigUInt64BE(BigInt(locs[0]), 0);
        buf.writeBigUInt64BE(BigInt(locs[1]), 8);
        return buf.toString('base64');
    }
    public async addContent(content: Buffer): Promise<string> {
        if (content.byteLength === 0) {
            throw errors.container[3];
        }
        if (this.freeSpacesList.length > 0) {
            const locs = Container.addressParseStr(this.freeSpacesList[0]);
            let spaceSize = (locs[1] - locs[0]) + 1;
            if (content.byteLength <= spaceSize) {
                const contentLocs: [number, number] = [locs[0], (locs[0] + content.byteLength - 1)];
                fs.writeSync(this.fd, content, 0, content.byteLength, locs[0]);
                this.freeSpacesList.shift();
                let leftoverSpace = spaceSize - content.byteLength;
                if (leftoverSpace !== 0) {
                    const leftoverLocs: [number, number] = [locs[0] + content.byteLength, locs[1]];
                    this.addFreeSpace(Container.addressParseLocs(leftoverLocs));
                }
                this.saveFreeSpaces();
                return Container.addressParseLocs(contentLocs);
            }
        }
        const bytes = fs.statSync(this.containerPath).size;
        const contentlocs: [number, number] = [bytes, (bytes + content.byteLength - 1)];
        fs.appendFileSync(this.containerPath, content);
        return Container.addressParseLocs(contentlocs);
    }
    public async rmContent(...addressItems: string[]): Promise<void> {
        let freeSpaces: string[] = [];
        const bytes = fs.statSync(this.containerPath).size;
        for (const address of addressItems) {
            const locs = Container.addressParseStr(address);
            if (locs[1] >= bytes) {
                throw errors.container[2];
            }
            freeSpaces.push(address);
        }
        this.addFreeSpace(...freeSpaces);
        this.saveFreeSpaces();
        return;
    }
    public async getContent(address: string): Promise<Buffer> {
        const bytes = fs.statSync(this.containerPath).size;
        const locs: [number, number] = Container.addressParseStr(address);
        if (locs[1] >= bytes) {
            throw errors.container[2];
        }
        let contentSize = locs[1] - locs[0] + 1;
        let buf = Buffer.alloc(contentSize);
        fs.readSync(this.fd, buf, 0, contentSize, locs[0]);
        return buf;
    }
    public closeContainer(): void {
        fs.closeSync(this.fd);
    }
    private constructor(containerPath: string, frspPath: string) {
        this.containerPath = containerPath;
        this.freeSpacesPath = frspPath;
        this.freeSpacesList = JSON.parse(fs.readFileSync(frspPath, { encoding: 'utf-8' }));
        this.fd = fs.openSync(containerPath, 'r+');
    }
}