import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import injectEnv from 'rollup-plugin-inject-process-env';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import fs from 'fs';
import path from 'path';

const production = !process.env.ROLLUP_WATCH;
const deleteSourceMaps = () => {
	let target = path.join(__dirname, 'core', 'build', 'bundle.js.map');
	try {
		fs.unlinkSync(target);
	} catch (e) { }
}

production && deleteSourceMaps();

let packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: !production,
		format: 'cjs',
		name: 'app',
		file: 'core/build/bundle.js'
	},
	external: ['mime-types', 'dompurify', 'fs', 'path', 'crypto', 'os'],
	plugins: [
		svelte({
			preprocess: sveltePreprocess({
				sourceMap: !production,
				postcss: true
			}),
			compilerOptions: {
				dev: !production
			}
		}),
		css({ output: 'bundle.css' }),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),
		resolve({
			browser: false,
			dedupe: ['svelte', 'three']
		}),
		commonjs(),
		injectEnv({
			PRODUCTION: production.toString(),
			PACKAGE_NAME: packageJson.name,
			PACKAGE_VERSION: packageJson.version
		}),
		production && terser()
	],
	watch: {
		clearScreen: false
	}
}