const esbuild = require('esbuild');
const { exec } = require('child_process');
const pino = require('pino');
const logger = pino({ name: 'build.js' });

async function check() {
  logger.info('Checking for typescript compilation errors...');
  await new Promise((resolve, reject) => {
    exec('npx tsc --noEmit', (err, stdout, stderr) => {
      if (err) {
        logger.error(stderr || stdout);
        reject(new Error('Type-checking failed. Please fix the errors and try again.'));
      }
      logger.info('No typescript errors found.');
      resolve();
    });
  });
  await new Promise((resolve, reject) => {
    logger.info('Checking for linting errors...');
    exec('npx eslint src --quiet', (err, stdout, stderr) => {
      if (err) {
        logger.error(stdout.trim());
        logger.error(stderr.trim());
        reject(new Error('Linting failed. Please fix the errors and try again.'));
      }
      logger.info('No linting errors found.');
      resolve();
    });
  });
}

async function build() {
  logger.info('Building the project...');
  try {
    await esbuild.build({
      entryPoints: ['src/main.ts'],
      bundle: true,
      minify: true,
      sourcemap: true,
      outfile: 'dist/index.js',
      platform: 'node',
    });
    logger.info('Project built successfully.');
  } catch (error) {
    logger.error('Build failed.');
    logger.error(error);
    process.exit(1);
  }
}

if (process.argv.includes('--no-check')) {
  build();
} else {
  check().then(build);
}
