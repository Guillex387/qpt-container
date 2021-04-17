import fs from 'fs';
import path from 'path';
import errors from './errors';
import { disksFolder } from './config';
interface Address {
    id: string;
    locations: [number, number];
}
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
    private containerPath: string;
    private addressFile: string;
    private addressList: Address[];
    private fd: number;
    private static updateAddrss(addrFilePath: string, newValue: Address[]): void {
        fs.writeFileSync(addrFilePath, Buffer.from(JSON.stringify(newValue), 'utf-8'));
    }
    private generateAddress(): string {
        const salt = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let address = '';
        for (let i = 0; i < 16; i++) {
            address += salt[Math.floor(Math.random() * salt.length)];
        }
        let IDexist = false;
        this.addressList.forEach(e => {
            if (e.id === address) {
                IDexist = true;
            }
        });
        if (IDexist) {
            return this.generateAddress();
        }
        return address;
    }
    private findAddress(address: string): number {
        let out = -1;
        this.addressList.forEach((e, index) => {
            if (e.id === address) {
                out = index;
            }
        });
        return out;
    }
    public async addContent(content: Buffer): Promise<string> {
        const bytes = fs.statSync(this.containerPath).size;
        const location: [number, number] = [bytes, (bytes + content.byteLength - 1)];
        fs.appendFileSync(this.containerPath, content);
        let address = this.generateAddress();
        this.addressList.push({ id: address, locations: location });
        Container.updateAddrss(this.addressFile, this.addressList);
        return address;
    }
    public async rmContent(address: string): Promise<void> {
        let index = this.findAddress(address);
        if (index === -1) {
            throw errors.container[2];
        }
        const locations: [number, number] = this.addressList[index].locations;
        this.addressList.splice(index, 1);
        const rmCount = (locations[1] - locations[0]) + 1;
        this.addressList.forEach((el, i) => {
            let b = el.locations[0] - rmCount;
            let e = el.locations[1] - rmCount;
            if (b >= 0) {
                this.addressList[i].locations = [b, e];
            }
        });
        const bytes = fs.statSync(this.containerPath).size;
        let afterBytes = Buffer.alloc(bytes - rmCount - locations[0]);
        fs.readSync(this.fd, afterBytes, 0, afterBytes.byteLength, (locations[1] + 1));
        fs.truncateSync(this.containerPath, locations[0]);
        fs.appendFileSync(this.containerPath, afterBytes);
        Container.updateAddrss(this.addressFile, this.addressList);
        return;
    }
    public async getContent(address: string): Promise<Buffer> {
        let index = this.findAddress(address);
        if (index === -1) {
            throw errors.container[2];
        }
        const locations = this.addressList[index].locations;
        let buf = Buffer.alloc((locations[1] - locations[0]) + 1);
        fs.readSync(this.fd, buf, 0, ((locations[1] - locations[0]) + 1), locations[0]);
        return buf;
    }
    public closeContainer(): void {
        fs.closeSync(this.fd);
    }
    private constructor(containerPath: string, addressPath: string) {
        this.containerPath = containerPath;
        this.addressFile = addressPath;
        this.addressList = JSON.parse(fs.readFileSync(addressPath, { encoding: 'utf-8' }));
        this.fd = fs.openSync(containerPath, 'r');
    }
}