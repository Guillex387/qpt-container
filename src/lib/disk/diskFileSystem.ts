import { BufferToUInt, UIntToBuffer } from '../../utils/binNums';
import AES from '../aes';
import { ItemDontExists, ItemAlreadyExists } from '../error';
import SHA from '../sha';
import Block from './block';
import BlockManager from './blockManager';
import DiskInterface, { INDICATOR_SIZE } from './diskInterface';

interface FileMetatada {
  name: string;
  type: 'file' | 'folder';
  opt: Object;
}

export class File {
  public initBlock: Block;
  public disk: DiskInterface;
  public blockManager: BlockManager;
  public parent: Folder | null;

  get data(): Buffer {
    let metadataSizeBuffer = this.blockManager.readData(this.initBlock, 0, INDICATOR_SIZE);
    let metadataSize = BufferToUInt(metadataSizeBuffer);
    let fileHeaderSize = INDICATOR_SIZE + metadataSize;
    return this.blockManager.readData(this.initBlock, fileHeaderSize);
  }
  set data(value: Buffer) {
    let metadataBuffer = Buffer.from(JSON.stringify(this.metadata), 'utf-8');
    let metadataSizeBuffer = UIntToBuffer(metadataBuffer.length);
    this.blockManager.writeData(Buffer.concat([metadataSizeBuffer, metadataBuffer, value]), this.initBlock);
  }

  get metadata(): FileMetatada {
    let metadataSizeBuffer = this.blockManager.readData(this.initBlock, 0, INDICATOR_SIZE);
    let metadataSize = BufferToUInt(metadataSizeBuffer);
    let metadataBuffer = this.blockManager.readData(this.initBlock, INDICATOR_SIZE, metadataSize);
    return JSON.parse(metadataBuffer.toString('utf-8'));
  }
  set metadata(value: FileMetatada) {
    let metadataBuffer = Buffer.from(JSON.stringify(value), 'utf-8');
    let metadataSizeBuffer = UIntToBuffer(metadataBuffer.length);
    let data = this.data;
    this.blockManager.writeData(Buffer.concat([metadataSizeBuffer, metadataBuffer, data]), this.initBlock);
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
  getFile(path: string[]): File | null {
    let hashPath = path.map(item => SHA.hash(item));
    let currentFolder: Folder = this;
    for (let i = 0; i < hashPath.length; i++) {
      const hash = hashPath[i];
      let initBlock = currentFolder.dataFolder.get(hash);
      if (initBlock === undefined) return null;
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
  public name: string;
  public disk: DiskInterface;
  public root: RootFolder;

  public readFile(path: string[]): Buffer {
    let file = this.root.getFile(path);
    if (!file) throw new ItemDontExists();
    if (file.metadata.type === 'folder') throw new ItemDontExists();
    return file.data;
  }

  public readFolder(path: string[]): File[] {
    let file = this.root.getFile(path) as Folder;
    if (!file) throw new ItemDontExists();
    if (file.metadata.type === 'file') throw new ItemDontExists();
    let matrix = Array.from(file.dataFolder.entries());
    let childList = matrix.map(item => new File(this.disk, file, item[1]));
    return childList;
  }

  public writeFile(path: string[], buffer: Buffer, additionalData: Object = {}) {
    let file = this.root.getFile(path);
    if (!file) throw new ItemDontExists();
    if (file.metadata.type === 'folder') throw new ItemDontExists();
    file.metadata = {
      ...file.metadata,
    };
    file.data = buffer;
  }

  public createFile(path: string[], buffer: Buffer, additionalData: Object = {}): File {
    if (this.root.getFile(path)) throw new ItemAlreadyExists();
    let name = path.pop();
    let parent = this.root.getFile(path) as Folder;
    if (!parent || parent.metadata.type === 'file') throw new ItemDontExists();
    let initBlock = this.root.blockManager.writeData(Buffer.alloc(0));
    let file = new File(this.disk, parent, initBlock);
    file.metadata = {
      name,
      type: 'file',
      opt: additionalData,
    };
    file.data = buffer;
    let map = parent.dataFolder;
    map.set(SHA.hash(name), initBlock);
    parent.dataFolder = map;
    return file;
  }

  public createFolder(path: string[], additionalData: Object = {}): Folder {
    if (this.root.getFile(path)) throw new ItemAlreadyExists();
    let name = path.pop();
    let parent = this.root.getFile(path) as Folder;
    if (!parent || parent.metadata.type === 'file') throw new ItemDontExists();
    let initBlock = this.root.blockManager.writeData(Buffer.alloc(0));
    let file = new File(this.disk, parent, initBlock) as Folder;
    file.metadata = {
      name,
      type: 'folder',
      opt: additionalData,
    };
    file.dataFolder = new Map();
    let map = parent.dataFolder;
    map.set(SHA.hash(name), initBlock);
    parent.dataFolder = map;
    return file;
  }

  public renameFile(path: string[], newName: string) {
    let file = this.root.getFile(path);
    let oldName = path.pop();
    let parent = this.root.getFile(path) as Folder;
    if (!file || !parent || parent.metadata.type === 'file') throw new ItemDontExists();
    file.metadata = {
      ...file.metadata,
      name: newName,
    };
    let map = parent.dataFolder;
    map.delete(SHA.hash(oldName));
    map.set(SHA.hash(newName), file.initBlock);
    parent.dataFolder = map;
  }

  public removeFile(path: string[]) {
    let file = this.root.getFile(path);
    let name = path.pop();
    let parent = this.root.getFile(path) as Folder;
    if (!file || !parent || parent.metadata.type === 'file') throw new ItemDontExists();
    this.root.blockManager.removeData(file.initBlock);
    let map = parent.dataFolder;
    map.delete(SHA.hash(name));
    parent.dataFolder = map;
  }

  constructor(disk: DiskInterface) {
    this.disk = disk;
    this.root = new RootFolder(this.disk);
  }
}

export default FileSystem;
