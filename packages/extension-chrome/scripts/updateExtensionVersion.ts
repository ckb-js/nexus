import fs from 'fs';

const packageJsonFile = fs.readFileSync('./package.json', 'utf8');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const currentVersion = JSON.parse(packageJsonFile).version;
console.log('Current Version is: ', currentVersion);

const manifestFile = fs.readFileSync('./public/manifest.json', 'utf8');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const extensionVersion = JSON.parse(manifestFile).version;
console.log('Extension Version is: ', extensionVersion);

if (currentVersion !== extensionVersion) {
  console.log('Versions do not match. Updating extension version...');
  const newManifestFile = manifestFile.replace(/"version": ".*"/, `"version": "${currentVersion}"`);
  fs.writeFileSync('./public/manifest.json', newManifestFile);
}
