import Container from './container';
import * as path from 'path';
import * as fs from 'fs';
import { disksFolder } from '../config';
import Encryptor from './crypter';
import errors from '../errors';
interface IFile {
    type: "file";
    name: string;
    mimeType: string;
    content: string;
}
interface IFolder {
    type: "folder";
    name: string;
    content: ITree;
}
type ITree = (IFile | IFolder)[];
export default class Disk {
    private pass: string;
    private container: Container;
    private mapFilePath: string;
    public name: string;
    public tree: ITree;
    public verify(pass: string): boolean {
        return (this.pass === pass);
    }
    public save(): void {
        let treeStr = JSON.stringify(this.tree);
        let bin = Buffer.from(treeStr, 'utf-8');
        let encodedData = Encryptor.encrypt(bin, this.pass);
        fs.writeFileSync(this.mapFilePath, encodedData);
    }
    public async getFileContent(path: string[], tree: ITree = this.tree): Promise<{ data: Buffer, mimeType: string }> {
        let pathCopy = [...path];
        let target = pathCopy.shift();
        for (const node of tree) {
            if (node.name === target) {
                if (node.type == 'folder') {
                    return await this.getFileContent(pathCopy, node.content);
                }
                let rawData = await this.container.getContent(node.content);
                let data = Encryptor.decrypt(rawData, this.pass);
                return { data, mimeType: node.mimeType };
            }
        }
        throw errors.disk[2];
    }
    private getAddressList(tree: ITree): string[] {
        let addressList: string[] = [];
        for (const node of tree) {
            if (node.type == 'file') {
                addressList.push(node.content);
            } else {
                let subNodeAddress = this.getAddressList(node.content);
                addressList.push(...subNodeAddress);
            }
        }
        return addressList;
    }
    public async addFile(folderPath: string[], file: { name: string, mimeType: string, content: Buffer }, tree: ITree = this.tree, recursive: boolean = false): Promise<void> {
        if (folderPath.length === 0 && !recursive) {
            let index = tree.findIndex(item => item.name === file.name);
            if (index !== -1) throw errors.disk[6];
            let data = Encryptor.encrypt(file.content, this.pass);
            let content = await this.container.addContent(data);
            tree.push({
                type: 'file',
                name: file.name,
                mimeType: file.mimeType,
                content
            });
            this.save();
            return;
        }
        let pathCopy = [...folderPath];
        let target = pathCopy.shift();
        for (let node of tree) {
            if (node.name === target && node.type == 'folder') {
                if (pathCopy.length === 0) {
                    let index = node.content.findIndex(item => item.name === file.name);
                    if (index !== -1) throw errors.disk[6];
                    let data = Encryptor.encrypt(file.content, this.pass);
                    let content = await this.container.addContent(data);
                    node.content.push({
                        type: 'file',
                        name: file.name,
                        mimeType: file.mimeType,
                        content
                    });
                    this.save();
                    return;
                }
                await this.addFile(pathCopy, file, node.content, true);
                return;
            }
        }
        throw errors.disk[3];
    }
    public addFolder(originPath: string[], name: string, tree: ITree = this.tree, recursive: boolean = false): void {
        if (originPath.length === 0 && !recursive) {
            let index = tree.findIndex(item => item.name === name);
            if (index !== -1) throw errors.disk[7];
            tree.push({
                type: 'folder',
                name,
                content: []
            });
            this.save();
            return;
        }
        let pathCopy = [...originPath];
        let target = pathCopy.shift();
        for (let node of tree) {
            if (node.name === target && node.type == 'folder') {
                if (pathCopy.length === 0) {
                    let index = node.content.findIndex(item => item.name === name);
                    if (index !== -1) throw errors.disk[7];
                    node.content.push({
                        type: 'folder',
                        name,
                        content: []
                    });
                    this.save();
                    return;
                }
                this.addFolder(pathCopy, name, node.content, true);
                return;
            }
        }
        throw errors.disk[3];
    }
    public async rmFile(path: string[], tree: ITree = this.tree): Promise<void> {
        let pathCopy = [...path];
        let target = pathCopy.shift();
        for (const node of tree) {
            if (node.name === target) {
                if (node.type == 'file') {
                    let index = tree.findIndex(item => item.name === node.name);
                    await this.container.rmContent(node.content);
                    tree.splice(index, 1);
                    this.save();
                    return;
                }
                await this.rmFile(pathCopy, node.content);
                return;
            }
        }
        throw errors.disk[2];
    }
    public async rmFolder(path: string[], tree: ITree = this.tree): Promise<void> {
        let pathCopy = [...path];
        let target = pathCopy.shift();
        for (const node of tree) {
            if (node.name === target && node.type == 'folder') {
                if (pathCopy.length === 0) {
                    let index = tree.findIndex(item => item.name === node.name);
                    let addressList = this.getAddressList(node.content);
                    await this.container.rmContent(...addressList);
                    tree.splice(index, 1);
                    this.save();
                    return;
                }
                await this.rmFolder(pathCopy, node.content);
                return;
            }
        }
        throw errors.disk[3];
    }
    public remove(): void {
        const pathsToRemove: string[] = [this.container.containerPath, this.container.freeSpacesPath, this.mapFilePath];
        this.container.closeContainer();
        pathsToRemove.forEach(path => fs.unlinkSync(path));
    }
    private constructor(name: string, pass: string, tree: ITree, container: Container, mapFilePath: string) {
        this.name = name;
        this.pass = pass;
        this.tree = tree;
        this.container = container;
        this.mapFilePath = mapFilePath;
    }
    public static create(name: string, pass: string): Disk {
        const mapFile = path.join(disksFolder, `${name}.map`);
        let container = Container.create(name);
        let treeEncoded = Encryptor.encrypt(Buffer.from('[]', 'utf-8'), pass);
        fs.writeFileSync(mapFile, treeEncoded);
        return new Disk(name, pass, [], container, mapFile);
    }
    public static select(name: string, pass: string): Disk {
        const mapFile = path.join(disksFolder, `${name}.map`);
        let container = Container.select(name);
        let treeData = fs.readFileSync(mapFile);
        let treeDataDecoded = Encryptor.decrypt(treeData, pass).toString('utf-8');
        let tree: ITree = JSON.parse(treeDataDecoded);
        return new Disk(name, pass, tree, container, mapFile);
    }
}