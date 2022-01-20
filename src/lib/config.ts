import path from 'path';

export const production = process.env.PRODUCTION === 'true';
export const portable = process.env.PORTABLE === 'true';
export const diskDataFile = production
  ? path.join(process.execPath, '..', 'disks.json')
  : path.join(__dirname, '..', 'test_data', 'disks.json');
