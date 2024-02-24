const esbuild = require('esbuild');
const { exec } = require('child_process');
const pino = require('pino');
const logger = pino({ name: 'build.js' });

logger.info('Type-checking the project...');
exec('npx tsc --noEmit', (err, stdout, stderr) => {
  if (err) {
    logger.error(stderr || stdout);
    logger.error('Type-checking failed. Please fix the errors and try again.');
    process.exit(1);
  }
  logger.info('Successfully type-checked the project.');
  logger.info('Checking for linting errors...');
  exec('npx eslint src --quiet', (err, stdout, stderr) => {
    if (err) {
      logger.error(stdout.trim());
      logger.error(stderr.trim());
      logger.error('Linting failed. Please fix the errors and try again.');
      process.exit(1);
    }
    logger.info('No linting errors found.');
    logger.info('Building the project...');
    esbuild
      .build({
        entryPoints: ['src/main.ts'],
        bundle: true,
        minify: true,
        sourcemap: true,
        outfile: 'dist/index.js',
        platform: 'node',
      })
      .then(() => {
        logger.info('Project built successfully.');
      })
      .catch((error) => {
        logger.error('Build failed.');
        logger.error(error);
        process.exit(1);
      });
  });
});
