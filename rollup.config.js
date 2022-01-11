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

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: !production,
		format: 'cjs',
		name: 'app',
		file: 'core/build/bundle.js'
	},
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
			dedupe: ['svelte']
		}),
		commonjs(),
		injectEnv({
			PRODUCTION: production.toString()
		}),
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};