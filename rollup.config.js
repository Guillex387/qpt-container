import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import injectEnv from 'rollup-plugin-inject-process-env';
import fs from 'fs'
import path from 'path'
const production = !process.env.ROLLUP_WATCH
const portable = process.env.PORTABLE || 'true';
function resetDir() {
    const mapFile = path.join(__dirname, 'app', 'bundle.js.map')
    try {
        fs.unlinkSync(mapFile)
    } catch (error) { }
}

production && resetDir()
export default {
    input: 'src/index.ts',
    external: ['os', 'fs', 'path', 'electron', 'events', 'zlib', 'crypto', 'mime-types'],
    plugins: [
        typescript({ target: 'es6' }),
        production && injectEnv({
            ELECTRON_ENV: 'production',
            PORTABLE_VERSION: portable
        }),
        production && terser({ compress: true, mangle: true, toplevel: true })
    ],
    output: {
        file: 'app/bundle.js',
        format: 'cjs',
        sourcemapFile: 'app/bundle.js.map',
        sourcemap: !production
    }
}