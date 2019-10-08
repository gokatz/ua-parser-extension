/* eslint-disable no-console */

const zipFolder = require('zip-folder');
const chalk = require('chalk');
const request = require('request');
const firebaseBaseUrl = 'https://gokatzme.firebaseio.com/youtaber';
const semver = require('semver');
const fs = require('fs');


let PROCESS = process; // eslint-disable-line no-undef
let { DEPLOYMENT, REFRESH_TOKEN, CLIENT_SECRET, CLIENT_ID, EXTENSION_ID } = PROCESS.env;

let versionFetchUrl = `${firebaseBaseUrl}/version/${DEPLOYMENT}.json`;
let isMajorRelease = false;
let isMinorRelease = false;

let folder = 'dist';
let zipName = 'extension.zip';

const webStore = require('chrome-webstore-upload')({
  extensionId: EXTENSION_ID,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  refreshToken: REFRESH_TOKEN
});

zipFolder(folder, zipName, function(err) {
  if (err) {
    console.log(chalk.red(`Error while zipping ${err}`));
    PROCESS.exit(1);
  } else {
    console.log(chalk.green(`Successfully Zipped ${folder} and saved as ${zipName}`));
    uploadAndPublishZip();
  }
});

function uploadAndPublishZip() {

  const extensionSource = fs.createReadStream(`./${zipName}`);
  webStore.uploadExisting(extensionSource).then(() => {
    console.log(chalk.green('Successfully uploaded the ZIP'));

    const target = DEPLOYMENT === 'staging' ? 'trustedTesters' : 'default';
    webStore.publish(target).then(() => {
      console.log(chalk.green('Successfully published the newer version'));
      incrementManifestVersion();
    }).catch((error) => {
      console.log(chalk.red(`Error while publishing uploaded extension: ${error}`));
      PROCESS.exit(1);
    });

  }).catch((error) => {
    console.log(chalk.red(`Error while uploading ZIP: ${error}`));
    PROCESS.exit(1);
  });
}

function incrementManifestVersion() {

  request(versionFetchUrl, function(error, response, body) {

    console.log('statusCode: ', response && response.statusCode);
    if (error) {
      console.log(chalk.red(`error: ${error}`));
      return;
    }
    let currentVersion = JSON.parse(body);

    let updateType = 'patch';

    if (DEPLOYMENT === 'production') {
      if (isMajorRelease) {
        updateType = 'major';
      } else if (isMinorRelease) {
        updateType = 'major';
      }
    }

    let incrementedVersion = semver.inc(currentVersion, updateType);

    console.log(chalk.blue(`Incremented version : ${incrementedVersion}`));

    request.put({ url: versionFetchUrl, form: JSON.stringify(incrementedVersion) }, function(error, httpResponse, body) {
      let parsedBody = JSON.parse(body);
      error = error || parsedBody.error;
      if (error) {
        console.log(chalk.red(`error: ${error}`));
        return;
      }
      console.log(chalk.green('Version updated in store'));
    });

  });
}
