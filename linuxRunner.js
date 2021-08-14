let path = require('path')
let fs = require('fs')
const script = '#!/bin/bash\nchmod +x ./qpt-container\n./qpt-container'
const runnerPath = path.join(__dirname, 'build', 'qpt-container-linux-x64', 'qpt-container.sh')
try {
    fs.writeFileSync(runnerPath, script, { encoding: 'utf-8' })
} catch (error) { }