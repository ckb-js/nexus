import { launchWithNexus } from '../../src/setup/launch';
import { MNEMONIC, NEXUS_BUILD_PATH, PASS_WORD, USER_NAME } from '../config/config';
import { setUpNexus } from '../../src/setup/setup';
import * as fs from 'fs';

async function init(): Promise<void> {
  // check tmp file
  if (checkDirExist('./tmp/nexus')) {
    // eslint-disable-next-line no-console
    console.log('tmp/nexus exist');
    return;
  }

  const browser = await launchWithNexus({ nexusPath: NEXUS_BUILD_PATH });
  await setUpNexus(browser, {
    // mock: true,
    userName: USER_NAME,
    seed: MNEMONIC,
    passwd: PASS_WORD,
  });
  await browser.close();
}

/**
 * Check if the specified path exists and is a directory.
 * @param path The path to check.
 * @returns true if the path exists and is a directory, otherwise false.
 */
function checkDirExist(path: string): boolean {
  try {
    // Use fs.statSync() method to get the status information of the specified path.
    const stat = fs.statSync(path);
    // Check if the specified path is a directory.
    return stat.isDirectory();
  } catch (e) {
    // If an exception is thrown, the specified path does not exist or is not a directory.
    return false;
  }
}

module.exports = async () => {
  await init();
  // eslint-disable-next-line no-console
  console.info('set up success');
};
