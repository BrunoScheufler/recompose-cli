#!/usr/bin/env node

import execa from 'execa';
import globby from 'globby';
import configstore from 'configstore';

// tslint:disable-next-line
const pkgInfo = require('../package.json');

const handleError = (err: Error) => {
	console.error(err);
	process.exit(1);
};

(async () => {
	process.on('uncaughtException', handleError);
	process.on('unhandledRejection', handleError);

	try {
		// Create or load configuration
		const config = new configstore(pkgInfo.name, {
			composeFileGlob: [
				'!node_modules',
				'docker-compose.yml',
				'*.docker-compose.yml',
				'*/**/docker-compose.yml',
				'*/**/*.docker-compose.yml'
			]
		});

		// Find compose files
		const composeFiles = await globby(config.get('composeFileGlob'), {
			onlyFiles: true
		});

		// Execute docker-compose
		const { code, stderr, stdout, signal } = await execa(
			'docker-compose',
			[...composeFiles.map(f => `-f ${f}`), ...process.argv.slice(2)],
			{
				shell: true
			}
		);

		// Return output and handle potential errors
		console.log(stdout);
		console.error(stderr);

		if (signal) {
			console.log(`Received signal ${signal}`);
			process.exit(1);
			return;
		}

		if (code !== 0) {
			console.log(`Exited with ${code}`);
			process.exit(code);
			return;
		}
	} catch (err) {
		handleError(err);
	}
})();
