const packager = require('electron-packager');
const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');

// Prepare the temp enviroment
console.log('Building env...');

const tempEnvDir = path.join(__dirname, 'tmp');
if (fs.existsSync(tempEnvDir)) fs.rmSync(tempEnvDir, { recursive: true, force: true });
fs.mkdirSync(tempEnvDir);
fs.copySync(path.join(__dirname, 'core'), path.join(tempEnvDir, 'core'));
fs.copySync(path.join(__dirname, 'package.json'), path.join(tempEnvDir, 'package.json'));
execSync("npm install --omit=dev", { cwd: tempEnvDir });

// Package the app

const defaultArchs = ['ia32', 'x64', 'arm64'];
const defaultPlatforms = ['win32', 'linux'];
let args = process.argv.slice(2);
let target = (args.length === 1) ? args[0].split('-') : null;
let [targetPlatform, targetArch] = target || [null, null];

let packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));

console.log('Packing the app...');

packager({
  appVersion: packageJson.version,
  appCopyright: 'qpt-container Copyright (c) 2021 Guillex387. All rights reserved.',
  arch: targetArch || defaultArchs,
  asar: true,
  buildVersion: packageJson.version,
  dir: tempEnvDir,
  icon: path.join(__dirname, 'assets', 'logo-win.ico'),
  name: packageJson.name,
  out: path.join(__dirname, 'bin'),
  overwrite: true,
  platform: targetPlatform || defaultPlatforms,
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