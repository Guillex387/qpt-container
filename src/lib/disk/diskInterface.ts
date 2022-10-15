import * as fs from 'fs';
import Error from '../error';
import { BufferToUInt, UIntToBuffer } from '../../utils/binNums';

export const INDICATOR_SIZE = 8;
interface DiskI {
  BLOCK_SIZE: number;
  BLOCK_DATA_SIZE: number;
  HEADER_SIZE: number;
  name: string;
  pass: string;
  metadata(): Object;
  size(): number;
  read(offset: number, length: number): Buffer;
  write(buffer: Buffer, offset: number): void;
  append(buffer: Buffer): void;
  destructor(): void;
}

export class DiskFile implements DiskI {
  private fd: number;
  public file: string;
  public BLOCK_SIZE: number;
  public BLOCK_DATA_SIZE: number;
  public HEADER_SIZE: number;
  public name: string;
  public pass: string;

  metadata(): Object {
    let headerLengthBuffer = this.read(0, INDICATOR_SIZE);
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

  static create(file: string, name: string, pass: string, metadata: Object) {
    let metadataBuffer = Buffer.from(JSON.stringify(metadata), 'utf-8');
    let defaultBuffer = [
      UIntToBuffer(metadataBuffer.length),
      metadataBuffer,
      Buffer.alloc(metadata['fragment-size'] + 2 * INDICATOR_SIZE),
      Buffer.alloc(metadata['fragment-size'] + 2 * INDICATOR_SIZE),
    ];
    try {
      fs.writeFileSync(file, Buffer.concat(defaultBuffer));
    } catch (error) {
      throw new Error(2);
    }
    return new DiskFile(file, name, pass);
  }

  constructor(file: string, name: string, pass: string) {
    try {
      this.fd = fs.openSync(file, 'r+');
    } catch (error) {
      throw new Error(2);
    }
    this.name = name;
    this.pass = pass;
    this.HEADER_SIZE = INDICATOR_SIZE + BufferToUInt(this.read(0, INDICATOR_SIZE));
    this.BLOCK_DATA_SIZE = this.metadata['fragment-size'];
    this.BLOCK_SIZE = this.BLOCK_DATA_SIZE + 2 * INDICATOR_SIZE;
  }
}

export default DiskI;
