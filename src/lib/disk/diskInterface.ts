import * as fs from 'fs';
import Error from '../error';
import { BufferToUInt, UIntToBuffer } from '../../utils/binNums';

abstract class DiskInterface {
  public static INDICATOR_SIZE: number = 8;
  public BLOCK_SIZE: number;
  public BLOCK_DATA_SIZE: number;
  public HEADER_SIZE: number;

  get metadata(): Object {
    return {};
  }

  size(): number {
    return 0;
  }
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

  get metadata(): Object {
    let headerLengthBuffer = this.read(0, DiskInterface.INDICATOR_SIZE);
    let headerLength = BufferToUInt(headerLengthBuffer);
    let headerString = this.read(8, headerLength).toString('utf-8');
    return JSON.parse(headerString);
  }

  size(): number {
    return fs.statSync(this.file).size;
  }

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

  static create(file: string, metadata: Object) {
    let metadataBuffer = Buffer.from(JSON.stringify(metadata), 'utf-8');
    let defaultBuffer = [
      UIntToBuffer(metadataBuffer.length),
      metadataBuffer,
      Buffer.alloc(metadata['fragment-size'] + 2 * DiskInterface.INDICATOR_SIZE),
      Buffer.alloc(metadata['fragment-size'] + 2 * DiskInterface.INDICATOR_SIZE),
    ];
    try {
      fs.writeFileSync(file, Buffer.concat(defaultBuffer));
    } catch (error) {
      throw new Error(2);
    }
    return new DiskFile(file);
  }

  constructor(file: string) {
    super();
    try {
      this.fd = fs.openSync(file, 'r+');
    } catch (error) {
      throw new Error(2);
    }
    this.HEADER_SIZE = DiskInterface.INDICATOR_SIZE + BufferToUInt(this.read(0, DiskInterface.INDICATOR_SIZE));
    this.BLOCK_DATA_SIZE = this.metadata['fragment-size'];
    this.BLOCK_SIZE = this.BLOCK_DATA_SIZE + 2 * DiskInterface.INDICATOR_SIZE;
  }
}

export default DiskInterface;
