/* eslint-disable no-console */

const fs = require('fs');
const manifestFilePath = './dist/manifest.json';
const request = require('request');
const chalk = require('chalk');
const semver = require('semver');

const firebaseBaseUrl = 'https://gokatzme.firebaseio.com/ua_parser_ext';

let DEPLOYMENT = process.env.DEPLOYMENT;
let versionFetchUrl = `${firebaseBaseUrl}/version/${DEPLOYMENT}.json`;

request(versionFetchUrl, function(error, response, body) {

  console.log('statusCode: ', response && response.statusCode);
  if (error) {
    console.log(chalk.red(`error: ${error}`));
    return;
  }
  let currentVersion = JSON.parse(body);
  let incrementedVersion = semver.inc(currentVersion, 'patch');

  console.log(chalk.blue(`Incremented version : ${incrementedVersion}`));

  let manifestFile = fs.readFileSync(manifestFilePath, 'utf8');
  let manifestJson = JSON.parse(manifestFile);

  manifestJson.version = incrementedVersion;
  let modifiedManifestFile = stringify(manifestJson);

  fs.writeFile(manifestFilePath, modifiedManifestFile, 'utf8');
});

function stringify(json) {
  return JSON.stringify(json, null, 2);
}
