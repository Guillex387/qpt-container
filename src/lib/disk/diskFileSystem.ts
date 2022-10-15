import { BufferToUInt, UIntToBuffer } from '../../utils/binNums';
import AES from '../aes';
import Error from '../error';
import SHA from '../sha';
import Block from './block';
import BlockManager from './blockManager';
import DiskInterface, { INDICATOR_SIZE } from './diskInterface';

export class File {
  public initBlock: Block;
  public disk: DiskInterface;
  public blockManager: BlockManager;
  public parent: Folder | null;

  get data(): Buffer {
    // TODO
  }
  set data(b: Buffer) {
    // TODO
  }

  get metadata(): Object {
    // TODO
  }
  set metadata(value: Object) {
    // TODO
  }

  constructor(disk: DiskInterface, parent: Folder | null, initBlock: Block) {
    this.disk = disk;
    this.parent = parent;
    this.blockManager = new BlockManager(this.disk);
    this.initBlock = initBlock;
  }
}
export class Folder extends File {
  get dataFolder(): Map<Buffer, Block> {
    let dataBuffer = this.data;
    let data: [Buffer, Block][] = [];
    for (let i = 0; i < dataBuffer.length; i += SHA.HASH_SIZE + INDICATOR_SIZE) {
      data.push([
        dataBuffer.slice(i, i + SHA.HASH_SIZE),
        new Block(BufferToUInt(dataBuffer.slice(i + SHA.HASH_SIZE, i + SHA.HASH_SIZE + INDICATOR_SIZE)), this.disk),
      ]);
    }
    return new Map(data);
  }
  set dataFolder(map: Map<Buffer, Block>) {
    let bufferPart: Buffer[] = [];
    for (const entrie of map.entries()) {
      bufferPart.push(Buffer.concat([entrie[0], UIntToBuffer(entrie[1].id)]));
    }
    this.data = Buffer.concat(bufferPart);
  }

  constructor(disk: DiskInterface, parent: Folder, initBlock: Block) {
    super(disk, parent, initBlock);
  }
}
export class RootFolder extends Folder {
  getFile(path: string[]): File {
    let hashPath = path.map(item => SHA.hash(Buffer.from(item, 'utf-8')));
    let currentFolder: Folder = this;
    for (let i = 0; i < hashPath.length; i++) {
      const hash = hashPath[i];
      let initBlock = currentFolder.dataFolder.get(hash);
      if (initBlock === undefined) throw new Error(6);
      let file = new File(this.disk, currentFolder, initBlock);
      if (i + 1 === hashPath.length) return file;
      else if (file.metadata['type'] === 'folder') currentFolder = file as Folder;
    }
  }

  constructor(disk: DiskInterface) {
    super(disk, null, new Block(1, disk));
    let bufferContent = this.blockManager.readData(this.initBlock);
    let defaultBufferData = AES.encrypt(Buffer.from('{}', 'utf-8'), this.disk.pass);
    if (bufferContent.length === 0) this.blockManager.writeData(defaultBufferData);
  }
}

class FileSystem {
  public disk: DiskInterface;
  public name: string;

  public readFile(path: string[]) {}

  public readFolder(path: string[]) {}

  public writeFile(path: string[], buffer: Buffer) {}

  public createFile(path: string[], buffer: Buffer) {}

  public createFolder(path: string[]) {}

  public renameFile(path: string[], newName: string) {}

  public removeFile(path: string[]) {}

  constructor(disk: DiskInterface) {
    this.disk = disk;
  }
}

export default FileSystem;
