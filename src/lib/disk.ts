import fs from 'fs';
import Error from './error';

class Disk {
  private fd: number;
  public BLOCK_SIZE: number;
  public diskPath: string;

  public getBlockData(block: number) {
    let lengthOffset = this.BLOCK_SIZE * block + 8;
    let lengthBuffer = Buffer.alloc(8);
    try {
      fs.readSync(this.fd, lengthBuffer, {
        offset: lengthOffset,
      });
    } catch (error) {
      throw new Error(3);
    }
    let length = Number(lengthBuffer.readBigUInt64BE(0));
    let pointerOffset = lengthOffset + this.BLOCK_SIZE;
    let pointerBuffer = Buffer.alloc(8);
    try {
      fs.readSync(this.fd, pointerBuffer, {
        offset: pointerOffset,
      });
    } catch (error) {
      throw new Error(3);
    }
    let pointer = Number(pointerBuffer.readBigUInt64BE(0));
    return { length, pointer };
  }

  public readData(block: number): Buffer {
    let blockData = this.getBlockData(block);
    let dataPart = Buffer.alloc(blockData.length || this.BLOCK_SIZE);
    let offset = this.BLOCK_SIZE * block + 16;
    try {
      fs.readSync(this.fd, dataPart, { offset });
    } catch (error) {
      throw new Error(3);
    }
    if (!blockData.pointer) return dataPart;
    let nextPart = this.readData(blockData.pointer);
    return Buffer.concat([dataPart, nextPart]);
  }

  public createBlock() {
    let blockBuffer = Buffer.alloc(this.BLOCK_SIZE + 16);
    try {
      fs.appendFileSync(this.diskPath, blockBuffer);
    } catch (error) {
      throw new Error(4);
    }
    let diskSize = fs.statSync(this.diskPath).size;
    return (diskSize - 8) / (this.BLOCK_SIZE + 16);
  }

  public getFreeBlock() {
    // TODO
  }

  public writeData() {
    // TODO
  }

  public truncateData() {
    // TODO
  }

  public appendData() {
    // TODO
  }

  constructor(file: string) {
    this.diskPath = file;
    let exists = fs.existsSync(file);
    if (!exists) throw new Error(2);
    this.fd = fs.openSync(file, 'r+');
    let buf: Buffer = Buffer.alloc(8);
    fs.readSync(this.fd, buf);
    this.BLOCK_SIZE = Number(buf.readBigUInt64BE(0)) + 16;
  }
}

export default Disk;
