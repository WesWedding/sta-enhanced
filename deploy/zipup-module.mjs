/**
 * @file Zip only the files we wish to deploy with the next release.
 */

import { exit } from 'node:process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import archiver from 'archiver';

if (!process.env.npm_package_version) {
  console.warn('This must be run via NPM.');
  exit(0);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const version = process.env.npm_package_version;

const output = fs.createWriteStream(__dirname + `/../dist/sta-enhanced-v${version}.zip`);
const archive = archiver('zip', {}); // TODO: Options?

output.on('close', () => {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file has closed');
});

output.on('end', () => {
  console.log('data has been drained');
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.log('NOENT');
  }
  else {
    throw err;
  }
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

archive.glob(
  '**', {
    ignore: ['deploy/**', 'dist/**', 'eslint*', 'package*.json', 'node_modules/**', '.*/**'],
  },
);

archive.finalize();
