import { BufferToUInt, UIntToBuffer } from '../../utils/binNums';
import AES from '../aes';
import SHA from '../sha';
import Block from './block';
import BlockManager from './blockManager';
import DiskInterface from './diskInterface';

export class File {
  public initBlock: Block;
  public disk: DiskInterface;
  public blockManager: BlockManager;
  public root: RootFolder;
  public parent: Folder | null;
  // public metadata: Object;

  get rawContent(): { metadataBuffer: Buffer; dataBuffer: Buffer } {
    let fileBuffer = this.blockManager.readData(this.initBlock);
    let metadataBufferLength = BufferToUInt(fileBuffer.slice(0, DiskInterface.INDICATOR_SIZE));
    let metadataBuffer = fileBuffer.slice(DiskInterface.INDICATOR_SIZE, metadataBufferLength);
    let dataBuffer = fileBuffer.slice(DiskInterface.INDICATOR_SIZE + metadataBufferLength);
    return { metadataBuffer, dataBuffer };
  }
  set rawContent(value: { metadataBuffer: Buffer; dataBuffer: Buffer }) {
    this.blockManager.writeData(
      Buffer.concat([UIntToBuffer(value.metadataBuffer.length), value.metadataBuffer, value.dataBuffer]),
      this.initBlock
    );
  }

  get data(): Buffer {
    return AES.decrypt(this.rawContent.dataBuffer, this.disk.pass);
  }
  set data(b: Buffer) {
    let bufferEncrypted = AES.encrypt(b, this.disk.pass);
    this.rawContent = {
      metadataBuffer: this.rawContent.metadataBuffer,
      dataBuffer: bufferEncrypted,
    };
  }

  get metadata(): Object {
    let metadataBuffer = AES.decrypt(this.rawContent.metadataBuffer, this.disk.pass);
    return JSON.parse(metadataBuffer.toString('utf-8'));
  }
  set metadata(value: Object) {
    let metaDataBuffer = Buffer.from(JSON.stringify(value), 'utf-8');
    this.rawContent = {
      metadataBuffer: AES.encrypt(metaDataBuffer, this.disk.pass),
      dataBuffer: this.rawContent.dataBuffer,
    };
  }

  constructor(disk: DiskInterface, parent: Folder | null, initBlock: Block) {
    this.disk = disk;
    this.parent = parent;
    this.blockManager = new BlockManager(this.disk);
    this.root = new RootFolder(this.disk);
    this.initBlock = initBlock;
  }
}
export class Folder extends File {
  get dataFolder(): Map<Buffer, Block> {
    let dataBuffer = this.data;
    let data: [Buffer, Block][] = [];
    for (let i = 0; i < dataBuffer.length; i += SHA.HASH_SIZE + DiskInterface.INDICATOR_SIZE) {
      data.push([
        dataBuffer.slice(i, i + SHA.HASH_SIZE),
        new Block(BufferToUInt(dataBuffer.slice(i + SHA.HASH_SIZE, i + SHA.HASH_SIZE + DiskInterface.INDICATOR_SIZE)), this.disk),
      ]);
    }
    return new Map(data);
  }

  constructor(disk: DiskInterface, parent: Folder, initBlock: Block) {
    super(disk, parent, initBlock);
  }
}

export class RootFolder extends Folder {
  // TODO getFile(path: string[]): File {}

  constructor(disk: DiskInterface) {
    super(disk, null, new Block(1, disk));
    let bufferContent = this.blockManager.readData(this.initBlock);
    let defaultBufferData = AES.encrypt(Buffer.from('{}', 'utf-8'), this.disk.pass);
    if (bufferContent.length === 0) this.blockManager.writeData(defaultBufferData);
  }
}

class FileSystem {
  public disk: DiskInterface;

  // TODO

  constructor(disk: DiskInterface) {
    this.disk = disk;
  }
}

export default FileSystem;
