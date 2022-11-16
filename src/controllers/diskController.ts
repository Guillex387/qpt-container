import { disksData, setDisksData } from './disksManager';
import DiskFileSystem from '../lib/disk/diskFileSystem';
import { loadedDisk, loadedDiskWorkPath, page } from '../globalState';
import { showErrorBox } from './dialogs';
import { DiskDontExists } from '../lib/error';
import { DiskFile } from '../lib/disk/diskInterface';

export const openDisk = (name: string, pass: string) => {
  let file = disksData()[name];
  if (!file) {
    showErrorBox(new DiskDontExists());
  }
  try {
    let diskFile = new DiskFile(file, pass);
    loadedDisk.set(new DiskFileSystem(diskFile));
    loadedDiskWorkPath.set([]);
    page.set('disk');
  } catch (error) {
    showErrorBox(error);
  }
};

export const createDisk = (name: string, pass: string, file: string) => {
  try {
    let diskFile = DiskFile.create(file, pass, {
      name,
      'fragment-size': 4000,
      encrypted: !!pass,
      opt: {},
    });
    let diskFileSystem = new DiskFileSystem(diskFile);
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
