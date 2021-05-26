import { app } from 'electron';
import path from 'path';
export const appPath: string = app.getAppPath();
export const production: boolean = true;
export const dataFolder: string = production ? path.join(appPath, '..', '..', 'data') : path.join(__dirname, '..', 'data');
export const controllerPath: string = path.join(dataFolder, 'disks.json');
export const disksFolder: string = path.join(dataFolder, 'disks');