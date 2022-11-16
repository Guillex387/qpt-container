import * as fs from 'fs';
import { diskDataFile } from '../lib/config';
import { disks } from '../globalState';

export interface DisksData {
  [name: string]: string;
}

export const disksData = (): DisksData => {
  let exists = fs.existsSync(diskDataFile);
  if (!exists) {
    fs.writeFileSync(diskDataFile, '{}');
    return {};
  }
  let jsonStr = fs.readFileSync(diskDataFile, { encoding: 'utf-8' });
  return JSON.parse(jsonStr);
};

export const setDisksData = (data: DisksData) => {
  disks.set(data);
  let dataStr = JSON.stringify(data);
  fs.writeFileSync(diskDataFile, dataStr);
};
