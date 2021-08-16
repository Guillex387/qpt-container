import errors from '../errors';
import Container from './container';
import Encryptor from './encryptor';
import { ITree } from './disk';
const tag = Buffer.from('--DISK qpt-container--', 'utf-8');

export class ExportCoder {
    private name: string;
    private tree: ITree;
    private container: Container;
    private contents: Buffer[] = [];
    private pass: string;

    constructor(name: string, tree: ITree, container: Container, pass: string) {
        this.name = name;
        this.tree = tree;
        this.pass = pass;
        this.container = container;
    }

    public async encode(): Promise<Buffer> {
        let tree = await this.indexer();
        let headerJson = Buffer.from(JSON.stringify(tree), 'utf-8');
        let headerBuf = Encryptor.encrypt(headerJson, this.pass);
        let headerLength: Buffer = Buffer.alloc(8);
        headerLength.writeBigUInt64BE(BigInt(headerBuf.byteLength), 0);
        let binHeader = Buffer.concat([headerLength, headerBuf]);
        let diskBuffer = [tag, binHeader];
        for (const data of this.contents)
            diskBuffer.push(data);
        return Buffer.concat(diskBuffer);
    }

    private async indexer(tree: ITree = this.tree) {
        let _tree: ITree = [...tree];
        for (let item of tree) {
            if (item.type == 'folder') {
                item.content = await this.indexer(item.content);
            } else {
                let data = await this.container.getContent(item.content);
                let offset = this.actualOffset();
                item.content = Container.addressParseLocs([offset, offset + data.byteLength - 1]);
                this.contents.push(data);
            }
        }
        return _tree;
    }

    private actualOffset(): number {
        let length = 0;
        for (const data of this.contents) {
            length += data.byteLength;
        }
        return length;
    }
}

export class ExportDecoder {
    private buffer: Buffer;
    private pass: string;

    constructor(buffer: Buffer, pass: string) {
        this.buffer = buffer;
        this.pass = pass;
    }

    public decode(): [ITree, Buffer] {
        let mark = this.buffer.slice(0, tag.length);
        let comparation = Buffer.compare(tag, mark);
        if (comparation !== 0) throw errors.exporter[0];
        let headerLengthBuf = this.buffer.slice(tag.length, tag.length + 8);
        let headerLength = Number(headerLengthBuf.readBigUInt64BE(0));
        let rawHeader = this.buffer.slice(tag.length + 8, tag.length + 8 + headerLength);
        let headerJson = Encryptor.decrypt(rawHeader, this.pass).toString('utf-8');
        let header = JSON.parse(headerJson);
        let contents = this.buffer.slice(tag.length + 8 + headerLength);
        return [header, contents];
    }
}