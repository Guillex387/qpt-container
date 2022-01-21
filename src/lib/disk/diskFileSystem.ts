import Disk from './disk';
import Error from '../error';

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

class DiskFileSystem {
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
    let childNodesStr = this.internalDisk.readData(initNode).toString('utf-8');
    let folder: FolderContent = JSON.parse(childNodesStr);
    if (!path.length && initNode === this.internalDisk.RESERVED_BLOCK) return folder;
    let pathClone = [...path];
    let target = pathClone.shift();
    for (const node of folder) {
      if (node.name === target && node.type === 'folder') {
        if (!pathClone.length) {
          let str = this.internalDisk.readData(node.initBlock).toString('utf-8');
          return JSON.parse(str) as FolderContent;
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
      if (node.name === target && node.type === 'file') return this.internalDisk.readData(node.initBlock);
    throw new Error(6);
  }

  public async writeFolder(path: string[], newContent: FolderContent) {
    let pathClone = [...path];
    let target = pathClone.pop();
    let parentFolder = await this.readFolder(pathClone);
    for (const node of parentFolder) {
      if (node.name === target && node.type === 'folder') {
        let newContentBuffer = Buffer.from(JSON.stringify(newContent), 'utf-8');
        this.internalDisk.writeData(newContentBuffer, { initBlock: node.initBlock });
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
        node.size = newContent.length;
        await this.writeFolder(pathClone, parentFolder);
        this.internalDisk.writeData(newContent, { initBlock: node.initBlock });
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
    let exists = await this.existsElement([...origin, name], 'file');
    if (exists) {
      throw new Error(7);
    }
    // TODO
  }

  public async createFolder(origin: string[], name: string) {
    let exists = await this.existsElement([...origin, name], 'folder');
    if (exists) {
      throw new Error(7);
    }
    // TODO
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

  public async removeFolder(path: string[]) {
    // TODO
  }

  constructor(file: string) {
    this.internalDisk = new Disk(file);
  }
}

export default DiskFileSystem;
