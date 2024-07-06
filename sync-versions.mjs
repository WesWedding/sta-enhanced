/**
 * @file Synchronize instances of version strings that appear in other important files.
 *
 * The module.json and package.json files should reference the same versions. Best run after
 * a 'npm version' call.
 */
import fs from 'fs';
import { exit } from 'node:process';

if (!process.env.npm_package_version) {
  console.warn('This must be run via NPM.');
  exit(0);
}

const moduleJson = 'module.json';

const moduleData = JSON.parse(fs.readFileSync(moduleJson).toString());

const downloadStr = moduleData.download;
const verson = process.env.npm_package_version;

const newDownload = downloadStr.replace(/(v)[0-9].[0-9].[0-9]/g, `$1${verson}`);
if (newDownload === downloadStr) {
  throw Error('Sync versions: Download string has not changed; expected a new version string.');
}

moduleData.download = newDownload;

fs.writeFileSync(moduleJson, JSON.stringify(moduleData, null, 2) + '\n');
