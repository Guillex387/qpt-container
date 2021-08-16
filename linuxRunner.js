let path = require('path')
let fs = require('fs')
const script = '#!/bin/bash\nchmod +x ./qpt-container\n./qpt-container'
const runnerPath = path.join(__dirname, 'build', 'qpt-container-linux-x64', 'qpt-container.sh')
const logoFileDest = path.join(__dirname, 'build', 'qpt-container-linux-x64', 'logo.png')
let logo = fs.readFileSync(path.join(__dirname, 'assets', 'logo.png'))
try {
    fs.writeFileSync(runnerPath, script, { encoding: 'utf-8' })
    fs.writeFileSync(logoFileDest, logo)
    console.log('Files (2) added')
} catch (error) { }