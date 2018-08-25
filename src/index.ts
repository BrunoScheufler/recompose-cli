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

		if (process.env.DEBUG_RECOMPOSE) {
			console.log(`Found ${composeFiles.length} compose files!`);
			composeFiles.forEach((file, index) =>
				console.log(`${index + 1}. ${file}`)
			);
		}

		// Execute docker-compose
		const composeProcess = execa(
			'docker-compose',
			[...composeFiles.map(f => `-f ${f}`), ...process.argv.slice(2)],
			{
				shell: true
			}
		);

		// Pipe recompose stdin to compose process
		process.stdin.pipe(composeProcess.stdin);

		// Pipe compose process output back to recompose streams
		composeProcess.stdout.pipe(process.stdout);
		composeProcess.stderr.pipe(process.stderr);

		composeProcess.on('error', handleError);

		// Handle child process exit
		composeProcess.on('exit', (code, signal) => {
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

			process.exit(0);
		});
	} catch (err) {
		handleError(err);
	}
})();
