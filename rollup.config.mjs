import typescript from '@rollup/plugin-typescript';

export default {
	input: 'src/nz-flyout.ts',
	output: {
		file: 'dist/nz-flyout.js',
		format: 'iife',
		name: 'NzFlyout'
	},
	plugins: [
		typescript()
	]
};
