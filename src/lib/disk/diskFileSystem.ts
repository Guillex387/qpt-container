import Disk, { createDisk } from './disk';
import Error from '../error';
import AES from '../aes';

const DEFAULT_BLOCK_DATA_SIZE = 4000;

export interface FileNodeI {
  type: 'file';
  initBlock: number;
  name: string;
  size: number;
}

export interface FolderNodeI {
  type: 'folder';
  initBlock: number;
  name: string;
}

export type FolderContent = (FileNodeI | FolderNodeI)[];

export function createDiskFileSystem(
  name: string,
  file: string,
  pass: string,
  blockDataSize: number = DEFAULT_BLOCK_DATA_SIZE
): DiskFileSystem {
  let disk = createDisk(file, blockDataSize);
  let initalData = Buffer.from(JSON.stringify([]), 'utf-8');
  let encryptedData = AES.encrypt(initalData, pass);
  disk.writeData(encryptedData, disk.RESERVED_BLOCK);
  disk.removeInstance();
  return new DiskFileSystem(file, pass, name);
}

class DiskFileSystem {
  public name: string;
  private pass: string;
  private internalDisk: Disk;

  public existsElement(path: string[], type: 'file' | 'folder'): boolean {
    let pathClone = [...path];
    let target = pathClone.pop();
    let parentFolder = this.readFolder(pathClone);
    for (const node of parentFolder) {
      if (node.name === target && node.type === type) return true;
    }
    return false;
  }

  public readFolder(path: string[], initNode: number = this.internalDisk.RESERVED_BLOCK): FolderContent {
    let childNodesBuffer = this.internalDisk.readData(initNode);
    let childNodesDecrypted = AES.decrypt(childNodesBuffer, this.pass).toString('utf-8');
    let folder: FolderContent = JSON.parse(childNodesDecrypted);
    if (!path.length) return folder;
    let pathClone = [...path];
    let target = pathClone.shift();
    for (const node of folder) {
      if (node.name === target && node.type === 'folder') {
        if (!pathClone.length) {
          let buffer = this.internalDisk.readData(node.initBlock);
          let decryptedStr = AES.decrypt(buffer, this.pass).toString('utf-8');
          return JSON.parse(decryptedStr) as FolderContent;
        } else return this.readFolder(pathClone, node.initBlock);
      }
    }
    throw new Error(6);
  }

  public readFile(path: string[]): Buffer {
    let pathClone = [...path];
    let target = pathClone.pop();
    let parentFolder = this.readFolder(pathClone);
    for (const node of parentFolder)
      if (node.name === target && node.type === 'file') {
        let encryptedData = this.internalDisk.readData(node.initBlock);
        return AES.decrypt(encryptedData, this.pass);
      }
    throw new Error(6);
  }

  public writeFolder(path: string[], newContent: FolderContent) {
    let pathClone = [...path];
    if (!pathClone.length) {
      let newContentBuffer = Buffer.from(JSON.stringify(newContent), 'utf-8');
      let newContentEncrypted = AES.encrypt(newContentBuffer, this.pass);
      this.internalDisk.writeData(newContentEncrypted, this.internalDisk.RESERVED_BLOCK);
      return;
    }
    let target = pathClone.pop();
    let parentFolder = this.readFolder(pathClone);
    for (const node of parentFolder) {
      if (node.name === target && node.type === 'folder') {
        let newContentBuffer = Buffer.from(JSON.stringify(newContent), 'utf-8');
        let newContentEncrypted = AES.encrypt(newContentBuffer, this.pass);
        this.internalDisk.writeData(newContentEncrypted, node.initBlock);
        return;
      }
    }
    throw new Error(6);
  }

  public writeFile(path: string[], newContent: Buffer) {
    let pathClone = [...path];
    let target = pathClone.pop();
    let parentFolder = this.readFolder(pathClone);
    for (const node of parentFolder) {
      if (node.name === target && node.type === 'file') {
        let encryptedContent = AES.encrypt(newContent, this.pass);
        node.size = encryptedContent.length;
        this.writeFolder(pathClone, parentFolder);
        this.internalDisk.writeData(encryptedContent, node.initBlock);
        return;
      }
    }
    throw new Error(6);
  }

  public renameElement(path: string[], type: 'file' | 'folder', newName: string) {
    let pathClone = [...path];
    let target = pathClone.pop();
    let parentFolder = this.readFolder(pathClone);
    for (let node of parentFolder)
      if (node.name === target && node.type === type) {
        node.name = newName;
        this.writeFolder(pathClone, parentFolder);
        return;
      }
    throw new Error(6);
  }

  public createFile(origin: string[], name: string, content: Buffer) {
    let contentEncrypted = AES.encrypt(content, this.pass);
    let exists = this.existsElement([...origin, name], 'file');
    if (exists) {
      throw new Error(7);
    }
    let parentFolder = this.readFolder(origin);
    let initBlock = this.internalDisk.writeData(contentEncrypted);
    parentFolder.push({
      type: 'file',
      name,
      initBlock,
      size: contentEncrypted.length,
    });
    this.writeFolder(origin, parentFolder);
  }

  public createFolder(origin: string[], name: string) {
    let exists = this.existsElement([...origin, name], 'folder');
    if (exists) {
      throw new Error(7);
    }
    let parentFolder = this.readFolder(origin);
    let initBlock = this.internalDisk.getFreeBlocks(1)[0];
    let content = Buffer.from('[]', 'utf-8');
    let contentEncrypted = AES.encrypt(content, this.pass);
    this.internalDisk.writeData(contentEncrypted, initBlock);
    parentFolder.push({
      type: 'folder',
      name,
      initBlock,
    });
    this.writeFolder(origin, parentFolder);
  }

  public removeFile(path: string[]) {
    let pathClone = [...path];
    let target = pathClone.pop();
    let parentFolder = this.readFolder(pathClone);
    for (let i = 0; i < parentFolder.length; i++) {
      let node = parentFolder[i];
      if (node.name === target && node.type === 'file') {
        parentFolder.splice(i, 1);
        this.writeFolder(pathClone, parentFolder);
        this.internalDisk.removeData(node.initBlock);
        return;
      }
    }
    throw new Error(6);
  }

  public removeFolder(path: string[], deleteNode: boolean = true) {
    let removeBlocks: number[] = [];
    let pathClone = [...path];
    let folderContent = this.readFolder(pathClone);
    for (const node of folderContent) {
      removeBlocks.push(node.initBlock);
      if (node.type === 'folder') this.removeFolder([...path, node.name], false);
    }
    if (deleteNode) {
      let target = pathClone.pop();
      let parentFolder = this.readFolder(pathClone);
      for (let i = 0; i < parentFolder.length; i++) {
        let node = parentFolder[i];
        if (node.name === target && node.type === 'folder') {
          parentFolder.splice(i, 1);
          this.writeFolder(pathClone, parentFolder);
          this.internalDisk.removeData(node.initBlock);
          return;
        }
      }
    }
    for (const block of removeBlocks) {
      this.internalDisk.removeData(block);
    }
  }

  constructor(file: string, pass: string, name: string) {
    this.internalDisk = new Disk(file);
    this.pass = pass;
    this.name = name;
  }
}

export default DiskFileSystem;
