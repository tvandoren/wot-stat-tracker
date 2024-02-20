const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: 'dist/index.js',
  platform: 'node', // if you're targeting Node.js
  target: 'es2017', // depending on what ECMAScript version you want to target
}).catch(() => process.exit(1));
