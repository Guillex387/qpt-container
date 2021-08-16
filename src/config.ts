import { app } from 'electron';
import { platform } from 'os';
import * as path from 'path';
import * as fs from 'fs';

// Platform
export const appPath: string = app.getAppPath();
const appData: string = path.join(app.getPath('appData'), 'qpt-container');
if (!fs.existsSync(appData)) fs.mkdirSync(appData);
export const production: boolean = process.env.ELECTRON_ENV === 'production';
export const isLinux: boolean = platform() == 'linux';
export const portable: boolean = process.env.PORTABLE_VERSION !== 'false';

// Data
const dataFolderPortable: string = production ? path.join(appPath, '..', '..', 'data') : path.join(__dirname, '..', 'data');
export const dataFolder: string = portable ? dataFolderPortable : path.join(appData, 'disk_data');
export const controllerPath: string = path.join(dataFolder, 'disks.json');
export const disksFolder: string = path.join(dataFolder, 'disks');

// Assets
export const appIcon: string = production ? path.join(appPath, '..', '..', 'logo.png') : path.join(__dirname, '..', 'assets', 'logo.png');