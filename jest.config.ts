import { Config } from 'jest';
import { join } from 'path';

const config: Config = {
  rootDir: join(__dirname, 'tests'),
  verbose: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
};

export default config;
