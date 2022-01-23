import { disksData, setDisksData } from './disksManager';
import DiskFileSystem, { createDiskFileSystem } from '../lib/disk/diskFileSystem';
import { loadedDisk, loadedDiskWorkPath, page } from '../globalState';
import { showErrorBox } from './dialogs';
import Error from '../lib/error';

export const openDisk = (name: string, pass: string) => {
  let file = disksData()[name];
  if (!file) {
    showErrorBox(new Error(2));
  }
  try {
    loadedDisk.set(new DiskFileSystem(file, pass, name));
    loadedDiskWorkPath.set([]);
    page.set('disk');
  } catch (error) {
    showErrorBox(error);
  }
};

export const createDisk = (name: string, pass: string, file: string) => {
  try {
    let diskFileSystem = createDiskFileSystem(name, file, pass);
    setDisksData({ ...disksData(), [name]: file });
    loadedDisk.set(diskFileSystem);
    loadedDiskWorkPath.set([]);
    page.set('disk');
  } catch (error) {
    showErrorBox(error);
  }
};

const getWorkPath = () => {
  return new Promise<string[] | null>(resolve => {
    loadedDiskWorkPath.subscribe(value => resolve(value));
  });
};

export const reloadDisk = async () => {
  let lastWorkPath = await getWorkPath();
  loadedDiskWorkPath.set(null);
  loadedDiskWorkPath.set(lastWorkPath);
};
