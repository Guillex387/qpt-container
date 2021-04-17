import { app } from 'electron';
import path from 'path';
export const appPath: string = app.getAppPath();
export const production: boolean = true;
export const controllerPath: string = production ? path.join(appPath, '..', 'disks.json') : path.join(__dirname, '..', 'disks.json');
export const disksFolder: string = production ? path.join(appPath, '..', 'disks') : path.join(__dirname, '..', 'disks');