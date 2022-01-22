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
  disk.writeData(encryptedData, {
    initBlock: disk.RESERVED_BLOCK,
  });
  disk.removeInstance();
  return new DiskFileSystem(file, pass, name);
}

class DiskFileSystem {
  public name: string;
  private pass: string;
  private internalDisk: Disk;

  public async existsElement(path: string[], type: 'file' | 'folder'): Promise<boolean> {
    let pathClone = [...path];
    let target = pathClone.pop();
    let parentFolder: FolderContent;
    try {
      parentFolder = await this.readFolder(pathClone);
    } catch (error) {
      return false;
    }
    for (const node of parentFolder) {
      if (node.name === target && node.type === type) return true;
    }
    return false;
  }

  public async readFolder(path: string[], initNode: number = this.internalDisk.RESERVED_BLOCK): Promise<FolderContent> {
    let childNodesBuffer = this.internalDisk.readData(initNode);
    let childNodesDecrypted = AES.decrypt(childNodesBuffer, this.pass).toString('utf-8');
    let folder: FolderContent = JSON.parse(childNodesDecrypted);
    if (!path.length && initNode === this.internalDisk.RESERVED_BLOCK) return folder;
    let pathClone = [...path];
    let target = pathClone.shift();
    for (const node of folder) {
      if (node.name === target && node.type === 'folder') {
        if (!pathClone.length) {
          let buffer = this.internalDisk.readData(node.initBlock);
          let decryptedStr = AES.decrypt(buffer, this.pass).toString('utf-8');
          return JSON.parse(decryptedStr) as FolderContent;
        } else return await this.readFolder(pathClone, node.initBlock);
      }
    }
    throw new Error(6);
  }

  public async readFile(path: string[]): Promise<Buffer> {
    let pathClone = [...path];
    let target = pathClone.pop();
    let parentFolder = await this.readFolder(pathClone);
    for (const node of parentFolder)
      if (node.name === target && node.type === 'file') {
        let encryptedData = this.internalDisk.readData(node.initBlock);
        return AES.decrypt(encryptedData, this.pass);
      }
    throw new Error(6);
  }

  public async writeFolder(path: string[], newContent: FolderContent) {
    let pathClone = [...path];
    let target = pathClone.pop();
    let parentFolder = await this.readFolder(pathClone);
    for (const node of parentFolder) {
      if (node.name === target && node.type === 'folder') {
        let newContentBuffer = Buffer.from(JSON.stringify(newContent), 'utf-8');
        let newContentEncrypted = AES.encrypt(newContentBuffer, this.pass);
        this.internalDisk.writeData(newContentEncrypted, { initBlock: node.initBlock });
        return;
      }
    }
    throw new Error(6);
  }

  public async writeFile(path: string[], newContent: Buffer) {
    let pathClone = [...path];
    let target = pathClone.pop();
    let parentFolder = await this.readFolder(pathClone);
    for (const node of parentFolder) {
      if (node.name === target && node.type === 'file') {
        let encryptedContent = AES.encrypt(newContent, this.pass);
        node.size = encryptedContent.length;
        await this.writeFolder(pathClone, parentFolder);
        this.internalDisk.writeData(encryptedContent, { initBlock: node.initBlock });
        return;
      }
    }
    throw new Error(6);
  }

  public async renameElement(path: string[], type: 'file' | 'folder', newName: string) {
    let pathClone = [...path];
    let target = pathClone.pop();
    let parentFolder = await this.readFolder(pathClone);
    for (let node of parentFolder)
      if (node.name === target && node.type === type) {
        node.name = newName;
        await this.writeFolder(pathClone, parentFolder);
        return;
      }
    throw new Error(6);
  }

  public async createFile(origin: string[], name: string, content: Buffer) {
    let contentEncrypted = AES.encrypt(content, this.pass);
    let exists = await this.existsElement([...origin, name], 'file');
    if (exists) {
      throw new Error(7);
    }
    let parentFolder = await this.readFolder(origin);
    let initBlock = this.internalDisk.writeData(contentEncrypted);
    parentFolder.push({
      type: 'file',
      name,
      initBlock,
      size: contentEncrypted.length,
    });
    await this.writeFolder(origin, parentFolder);
  }

  public async createFolder(origin: string[], name: string) {
    let exists = await this.existsElement([...origin, name], 'folder');
    if (exists) {
      throw new Error(7);
    }
    let parentFolder = await this.readFolder(origin);
    let initBlock = this.internalDisk.getFreeBlocks(1)[0];
    parentFolder.push({
      type: 'folder',
      name,
      initBlock,
    });
    await this.writeFolder(origin, parentFolder);
  }

  public async removeFile(path: string[]) {
    let pathClone = [...path];
    let target = pathClone.pop();
    let parentFolder = await this.readFolder(pathClone);
    for (let i = 0; i < parentFolder.length; i++) {
      let node = parentFolder[i];
      if (node.name === target && node.type === 'file') {
        parentFolder.splice(i, 1);
        await this.writeFolder(pathClone, parentFolder);
        this.internalDisk.removeData(node.initBlock);
        return;
      }
    }
    throw new Error(6);
  }

  public async removeFolder(path: string[], deleteNode: boolean = true) {
    let removeBlocks: number[] = [];
    let pathClone = [...path];
    let folderContent = await this.readFolder(pathClone);
    for (const node of folderContent) {
      removeBlocks.push(node.initBlock);
      if (node.type === 'folder') await this.removeFolder([...path, node.name], false);
    }
    if (deleteNode) {
      let target = pathClone.pop();
      let parentFolder = await this.readFolder(pathClone);
      for (let i = 0; i < parentFolder.length; i++) {
        let node = parentFolder[i];
        if (node.name === target && node.type === 'folder') {
          parentFolder.splice(i, 1);
          await this.writeFolder(pathClone, parentFolder);
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
