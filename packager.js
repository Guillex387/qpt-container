const packager = require('electron-packager');
const path = require('path');
const fs = require('fs');

let packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));

packager({
  appVersion: packageJson.version,
  appCopyright: 'qpt-container Copyright (c) 2021 Guillex387. All rights reserved.',
  arch: ['ia32', 'x64', 'arm64'],
  asar: true,
  buildVersion: packageJson.version,
  dir: __dirname,
  icon: path.join(__dirname, 'assets', 'logo-win.ico'),
  ignore: ['tsconfig.json', 'rollup.config.js', 'packager.js', '.gitignore', 'src', 'bin', '.vscode'],
  name: packageJson.name,
  out: path.join(__dirname, 'bin'),
  overwrite: true,
  platform: ['win32', 'linux'],
})
  .then(artifacts => {
    console.log('Artifacts:');
    const logoSrc = path.join(__dirname, 'assets', 'logo.png');
    for (const artifact of artifacts) {
      let logoDest = path.join(artifact, 'logo.png');
      fs.copyFileSync(logoSrc, logoDest);
      console.log(artifact);
    }
  })
  .catch(reason => {
    console.log('Error packaging the app');
    console.log(reason);
  });