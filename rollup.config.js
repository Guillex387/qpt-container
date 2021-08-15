import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import injectEnv from 'rollup-plugin-inject-process-env';
import fs from 'fs'
import path from 'path'
const production = !process.env.ROLLUP_WATCH
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
            ELECTRON_ENV: 'production'
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