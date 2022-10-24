import { BufferToUInt, UIntToBuffer } from '../../utils/binNums';
import DiskInterface, { INDICATOR_SIZE } from './diskInterface';
import { DiskWriteError } from '../error';
import AES from '../aes';

class Block {
  public static NULL_POINTER = Buffer.alloc(INDICATOR_SIZE);
  public id: number;
  public disk: DiskInterface;
  public realFragmentSize: number;

  protected encrypt(data: Buffer): Buffer | null {
    if (!this.disk.metadata.encrypted) return null;
    return AES.encrypt(data, this.disk.pass);
  }
  protected decrypt(data: Buffer): Buffer | null {
    if (!this.disk.metadata.encrypted) return null;
    return AES.decrypt(data, this.disk.pass);
  }

  get dataFrame(): Buffer {
    let dataOffset = this.disk.BLOCK_SIZE * this.id + INDICATOR_SIZE + this.disk.HEADER_SIZE;
    let dataRaw = this.disk.read(dataOffset, this.length);
    let dataEncoding = this.decrypt(dataRaw) ?? dataRaw;
    return dataEncoding;
  }
  set dataFrame(data: Buffer) {
    let dataEncoding = this.encrypt(data) ?? data;
    if (dataEncoding.length > this.disk.BLOCK_DATA_SIZE) throw new DiskWriteError();
    let dataOffset = this.disk.BLOCK_SIZE * this.id + INDICATOR_SIZE + this.disk.HEADER_SIZE;
    this.length = dataEncoding.length;
    this.disk.write(dataEncoding, dataOffset);
  }

  get length() {
    let lengthOffset = this.disk.BLOCK_SIZE * this.id + this.disk.HEADER_SIZE;
    let lengthBuffer = this.disk.read(lengthOffset, INDICATOR_SIZE);
    return BufferToUInt(lengthBuffer);
  }
  set length(l: number) {
    let lengthOffset = this.disk.BLOCK_SIZE * this.id + this.disk.HEADER_SIZE;
    this.disk.write(UIntToBuffer(l), lengthOffset);
  }

  get next(): Block | null {
    let pointerOffset = this.disk.BLOCK_SIZE * this.id + this.disk.HEADER_SIZE + INDICATOR_SIZE + this.disk.BLOCK_DATA_SIZE;
    let pointerBuffer = this.disk.read(pointerOffset, INDICATOR_SIZE);
    if (pointerBuffer.compare(Block.NULL_POINTER) === 0) return null;
    return new Block(BufferToUInt(pointerBuffer), this.disk);
  }
  set next(b: Block | null) {
    let pointerOffset = this.disk.BLOCK_SIZE * this.id + this.disk.HEADER_SIZE + INDICATOR_SIZE + this.disk.BLOCK_DATA_SIZE;
    if (!b) this.disk.write(Block.NULL_POINTER, pointerOffset);
    else this.disk.write(UIntToBuffer(b.id), pointerOffset);
  }

  array() {
    let list: Block[] = [];
    let currentBlock: Block | null = this;
    while (currentBlock !== null) {
      list.push(currentBlock);
      currentBlock = currentBlock.next;
    }
    return list;
  }

  realLength(): number {
    if (!this.disk.metadata.encrypted) return this.length;
    return this.length - AES.extraBytes;
  }

  static create(disk: DiskInterface, registry: boolean = false) {
    let buf = Buffer.alloc(disk.BLOCK_SIZE);
    let size = disk.size();
    disk.append(buf);
    let id = (size - disk.HEADER_SIZE) / disk.BLOCK_SIZE;
    return registry ? new RegistryBlock(id, disk) : new Block(id, disk);
  }

  constructor(id: number, disk: DiskInterface) {
    this.id = id;
    this.disk = disk;
    this.realFragmentSize = this.disk.realDataSize;
  }
}

export class RegistryBlock extends Block {
  protected encrypt(data: Buffer) {
    return null;
  }
  protected decrypt(data: Buffer) {
    return null;
  }

  realLength(): number {
    return this.length;
  }

  constructor(id: number, disk: DiskInterface) {
    super(id, disk);
    this.realFragmentSize = this.disk.BLOCK_DATA_SIZE;
  }
}

export default Block;
