import { BufferToUInt, UIntToBuffer } from '../../utils/binNums';
import DiskInterface, { INDICATOR_SIZE } from './diskInterface';
import { DiskWriteError } from '../error';

class Block {
  public static NULL_POINTER = Buffer.alloc(INDICATOR_SIZE);
  public id: number;
  public disk: DiskInterface;

  get dataFrame(): Buffer {
    let dataOffset = this.disk.BLOCK_SIZE * this.id + INDICATOR_SIZE + this.disk.HEADER_SIZE;
    return this.disk.read(dataOffset, this.length);
  }
  set dataFrame(b: Buffer) {
    if (b.length > this.disk.BLOCK_DATA_SIZE) throw new DiskWriteError();
    let dataOffset = this.disk.BLOCK_SIZE * this.id + INDICATOR_SIZE + this.disk.HEADER_SIZE;
    this.length = b.length;
    this.disk.write(b, dataOffset);
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
    let currentBlock: Block = this;
    while (currentBlock !== null) {
      list.push(currentBlock);
      currentBlock = currentBlock.next;
    }
    return list;
  }

  static create(disk: DiskInterface) {
    let buf = Buffer.alloc(disk.BLOCK_SIZE);
    let size = disk.size();
    disk.append(buf);
    let id = (size - disk.HEADER_SIZE) / disk.BLOCK_SIZE;
    return new Block(id, disk);
  }

  constructor(id: number, disk: DiskInterface) {
    this.id = id;
    this.disk = disk;
  }
}

export default Block;
