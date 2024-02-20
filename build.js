const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: 'dist/index.js',
  platform: 'node',
}).catch(() => process.exit(1));
