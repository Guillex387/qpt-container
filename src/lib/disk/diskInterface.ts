import * as fs from 'fs';
import Error from '../error';
import { BufferToUInt } from '../../utils/binNums';

abstract class DiskInterface {
  public BLOCK_SIZE: number;
  public BLOCK_DATA_SIZE: number;

  read(offset: number, length: number): Buffer {
    return Buffer.alloc(0);
  }
  write(buffer: Buffer, offset: number) {}
  append(buffer: Buffer) {}
  destructor() {}
}

export class DiskFile extends DiskInterface {
  private fd: number;
  public file: string;

  read(offset: number, length: number): Buffer {
    let buf = Buffer.alloc(length);
    try {
      fs.readSync(this.fd, buf, {
        position: offset,
      });
    } catch (error) {
      throw new Error(3);
    }
    return buf;
  }

  write(buffer: Buffer, offset: number) {
    try {
      fs.writeSync(this.fd, buffer, 0, buffer.length, offset);
    } catch (error) {
      throw new Error(4);
    }
  }

  append(buffer: Buffer) {
    try {
      fs.appendFileSync(this.file, buffer);
    } catch (error) {
      throw new Error(4);
    }
  }

  destructor() {
    fs.closeSync(this.fd);
  }

  constructor(file: string) {
    super();
    try {
      this.fd = fs.openSync(file, 'r+');
    } catch (error) {
      throw new Error(2);
    }
    this.BLOCK_DATA_SIZE = BufferToUInt(this.read(0, 8));
    this.BLOCK_SIZE = this.BLOCK_DATA_SIZE + 16;
  }
}

export default DiskInterface;
