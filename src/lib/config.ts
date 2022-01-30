import path from 'path';

export const production = process.env.PRODUCTION === 'true';
export const diskDataFile = production
  ? path.join(process.execPath, '..', 'disks.json')
  : path.join(__dirname, '..', 'test_data', 'disks.json');
