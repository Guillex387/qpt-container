import * as fs from 'fs';
import Error from '../error';
import { UIntToBuffer, BufferToUInt } from '../../utils/binNums';

export function createDisk(file: string, blockSize: number): Disk {
  let header = UIntToBuffer(blockSize);
  let registryBlock = Buffer.alloc(blockSize + 16);
  let reservedBlock = Buffer.alloc(blockSize + 16);
  try {
    fs.writeFileSync(file, Buffer.concat([header, registryBlock, reservedBlock]));
    return new Disk(file);
  } catch (error) {
    throw new Error(5);
  }
}

class Disk {
  private fd: number;
  public BLOCK_SIZE: number;
  public BLOCK_DATA_SIZE: number;
  public diskPath: string;
  public REGISTRY_BLOCK = 0;
  public RESERVED_BLOCK = 1;

  public getBlockDataLength(block: number) {
    let lengthOffset = this.BLOCK_SIZE * block + 8;
    let lengthBuffer = Buffer.alloc(8);
    try {
      fs.readSync(this.fd, lengthBuffer, {
        position: lengthOffset,
      });
    } catch (error) {
      throw new Error(3);
    }
    return BufferToUInt(lengthBuffer);
  }

  public getBlockDataPointer(block: number) {
    let pointerOffset = this.BLOCK_SIZE * block + 16 + this.BLOCK_DATA_SIZE;
    let pointerBuffer = Buffer.alloc(8);
    try {
      fs.readSync(this.fd, pointerBuffer, {
        position: pointerOffset,
      });
    } catch (error) {
      throw new Error(3);
    }
    return BufferToUInt(pointerBuffer);
  }

  public getBlockArray(initBlock: number) {
    let pointer = this.getBlockDataPointer(initBlock);
    let blockArray: number[] = [initBlock];
    if (!pointer) return blockArray;
    blockArray.push(...this.getBlockArray(pointer));
    return blockArray;
  }

  public getDataLength(initBlock: number) {
    let blockArray = this.getBlockArray(initBlock);
    let lastBlockLength = this.getBlockDataLength(blockArray.pop());
    return blockArray.length * this.BLOCK_DATA_SIZE + lastBlockLength;
  }

  public getFreeBlocks(n: number = 1): number[] {
    let bytesToRead = n * 8;
    let totalLength = this.getDataLength(this.REGISTRY_BLOCK);
    let readOffset = totalLength - bytesToRead;
    let buffer: Buffer;
    let extraBlocks: number[] = [];
    if (readOffset < 0) {
      buffer = this.readData(this.REGISTRY_BLOCK);
      extraBlocks = this.createBlocks((bytesToRead - totalLength) / 8);
      buffer.length && this.truncateData(this.REGISTRY_BLOCK, buffer.length);
    } else {
      buffer = this.readData(this.REGISTRY_BLOCK, readOffset, bytesToRead);
      this.truncateData(this.REGISTRY_BLOCK, bytesToRead);
    }
    let blocksFree: number[] = [];
    for (let i = 0; i < buffer.length / 8; i++) {
      let bigint = buffer.readBigUInt64BE(i * 8);
      blocksFree.push(Number(bigint));
    }
    return blocksFree.concat(extraBlocks);
  }

  public setBlocksFree(...blocks: number[]) {
    let allFreeBlocks = Buffer.concat(blocks.map(block => UIntToBuffer(block)));
    this.appendData(this.REGISTRY_BLOCK, allFreeBlocks);
  }

  public readData(initBlock: number, offset?: number, length?: number) {
    let blockArray = this.getBlockArray(initBlock);
    let fileParts: Buffer[] = [];
    for (const block of blockArray) {
      let partLength = this.getBlockDataLength(block);
      let part = Buffer.alloc(partLength);
      try {
        fs.readSync(this.fd, part, {
          position: this.BLOCK_SIZE * block + 16,
        });
      } catch (error) {
        throw new Error(3);
      }
      fileParts.push(part);
    }
    let buffer = Buffer.concat(fileParts);
    if (offset && length) return buffer.slice(offset, offset + length);
    if (offset) return buffer.slice(offset);
    return buffer;
  }

  public createBlocks(n: number = 1) {
    let newBlocks: number[] = [];
    for (let i = 0; i < n; i++) {
      let blockBuffer = Buffer.alloc(this.BLOCK_SIZE);
      let diskSize = fs.statSync(this.diskPath).size;
      try {
        fs.appendFileSync(this.diskPath, blockBuffer);
      } catch (error) {
        throw new Error(4);
      }
      newBlocks.push((diskSize - 8) / this.BLOCK_SIZE);
    }
    return newBlocks;
  }

  public writeData(data: Buffer, opts: { initBlock?: number } = {}) {
    let remainder = data.length % this.BLOCK_DATA_SIZE;
    let nBlocks = (data.length - remainder) / this.BLOCK_DATA_SIZE + 1;
    let blocks: number[];
    if (opts.initBlock === undefined) {
      blocks = this.getFreeBlocks(nBlocks);
    } else {
      let freeBlocks = this.getBlockArray(opts.initBlock);
      freeBlocks.shift();
      this.setBlocksFree(...freeBlocks);
      if (nBlocks == 1) {
        blocks = [opts.initBlock];
      } else {
        blocks = [opts.initBlock, ...this.getFreeBlocks(nBlocks - 1)];
      }
    }
    let dataOffset = 0;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      let dataPart: Buffer;
      let lengthBuffer: Buffer;
      let pointerBuffer: Buffer = Buffer.alloc(8);
      if (i + 1 === blocks.length) {
        dataPart = data.slice(dataOffset);
        lengthBuffer = UIntToBuffer(dataPart.length);
      } else {
        dataPart = data.slice(dataOffset, this.BLOCK_DATA_SIZE + dataOffset);
        lengthBuffer = UIntToBuffer(this.BLOCK_DATA_SIZE);
        pointerBuffer = UIntToBuffer(blocks[i + 1]);
      }
      let lengthOffset = this.BLOCK_SIZE * block + 8;
      let blockDataOffset = lengthOffset + 8;
      let pointerOffset = blockDataOffset + this.BLOCK_DATA_SIZE;
      try {
        fs.writeSync(this.fd, lengthBuffer, 0, lengthBuffer.length, lengthOffset);
        fs.writeSync(this.fd, dataPart, 0, dataPart.length, blockDataOffset);
        fs.writeSync(this.fd, pointerBuffer, 0, pointerBuffer.length, pointerOffset);
      } catch (error) {
        throw new Error(4);
      }
      dataOffset += dataPart.length;
    }
    return blocks[0];
  }

  public appendData(initBlock: number, data: Buffer) {
    let buffer = this.readData(initBlock);
    this.writeData(Buffer.concat([buffer, data]), { initBlock });
  }

  public truncateData(initBlock: number, bytes: number) {
    let buffer = this.readData(initBlock);
    let truncatedBuffer = buffer.slice(0, buffer.length - bytes);
    this.writeData(truncatedBuffer, { initBlock });
  }

  public removeData(initBlock: number) {
    let blockArray = this.getBlockArray(initBlock);
    this.setBlocksFree(...blockArray);
  }

  public removeInstance() {
    fs.closeSync(this.fd);
  }

  constructor(file: string) {
    this.diskPath = file;
    let exists = fs.existsSync(file);
    if (!exists) throw new Error(2);
    this.fd = fs.openSync(file, 'r+');
    let buf: Buffer = Buffer.alloc(8);
    fs.readSync(this.fd, buf);
    this.BLOCK_DATA_SIZE = BufferToUInt(buf);
    this.BLOCK_SIZE = this.BLOCK_DATA_SIZE + 16;
  }
}

export default Disk;
