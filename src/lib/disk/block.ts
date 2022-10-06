import { BufferToUInt, UIntToBuffer } from '../../utils/binNums';
import DiskInterface from './diskInterface';
import Error from '../error';

class Block {
  public static NULL_POINTER = Buffer.alloc(8);
  public id: number;
  public disk: DiskInterface;

  get dataFrame(): Buffer {
    let dataOffset = this.disk.BLOCK_SIZE * this.id + 16;
    return this.disk.read(dataOffset, this.length);
  }
  set dataFrame(b: Buffer) {
    if (b.length > this.disk.BLOCK_DATA_SIZE) throw new Error(4);
    let dataOffset = this.disk.BLOCK_SIZE * this.id + 16;
    this.length = b.length;
    this.disk.write(b, dataOffset);
  }

  get length() {
    let lengthOffset = this.disk.BLOCK_SIZE * this.id + 8;
    let lengthBuffer = this.disk.read(lengthOffset, 8);
    return BufferToUInt(lengthBuffer);
  }
  set length(l: number) {
    let lengthOffset = this.disk.BLOCK_SIZE * this.id + 8;
    this.disk.write(UIntToBuffer(l), lengthOffset);
  }

  get next(): Block | null {
    let pointerOffset = this.disk.BLOCK_SIZE * this.id + 16 + this.disk.BLOCK_DATA_SIZE;
    let pointerBuffer = this.disk.read(pointerOffset, 8);
    if (pointerBuffer.compare(Block.NULL_POINTER) === 0) return null;
    return new Block(BufferToUInt(pointerBuffer), this.disk);
  }
  set next(b: Block | null) {
    let pointerOffset = this.disk.BLOCK_SIZE * this.id + 16 + this.disk.BLOCK_DATA_SIZE;
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
    let id = (size - 8) / disk.BLOCK_SIZE;
    return new Block(id, disk);
  }

  constructor(id: number, disk: DiskInterface) {
    this.id = id;
    this.disk = disk;
  }
}

export default Block;
