import { BrowserContext, Page } from 'playwright';
import { NexusWallet } from '../../src/types';
import { failedTestScreenshot, injectionTestStatus, step } from '../util';
import { launchWithNexus } from '../../src/setup/launch';
import { MNEMONIC, NEXUS_BUILD_PATH, PASS_WORD, USER_NAME } from '../config/config';
import { setUpNexus } from '../../src/setup/setup';
import { wallet_enable, wallet_fullOwnership_getLiveCells } from '../../src/nexus/servicer/rpc';

injectionTestStatus();
describe('wallet_fullOwnership_getLiveCells', function () {
  let browser: BrowserContext;
  let nexusWallet: NexusWallet;
  let page: Page;
  it('get wallet_fullOwnership_getLiveCells response after wallet_enable => should return { objects: [], cursor: "" }', async () => {
    const connectedUrl = 'https://www.baidu.com';
    await step('launchWithNexus', async () => {
      browser = await launchWithNexus({ nexusPath: NEXUS_BUILD_PATH });
    });

    await step('setUpNexus', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      nexusWallet = await setUpNexus(browser, {
        mock: true,
        userName: USER_NAME,
        seed: MNEMONIC,
        passwd: PASS_WORD,
      });
    });

    await step('goto baidu', async () => {
      page = await browser.newPage();
      await page.goto(connectedUrl);
    });
    await step('connect', async () => {
      await Promise.all([wallet_enable(page), nexusWallet.connect()]);
    });

    await step('wallet_fullOwnership_getLiveCells', async () => {
      const ret = await wallet_fullOwnership_getLiveCells(page, {
        cursor:
          '99:0x409bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce801dafb7ea1dd60616fb9e9088332e5f975a68ac28e000000000082a3220000000700000000',
        change: 'internal',
      });
      expect(ret).toEqual({ objects: [], cursor: '' });
    });
  });
  afterEach(async () => {
    // @ts-ignore
    await failedTestScreenshot(browser);
  });

  afterAll(async () => {
    await browser.close();
  });
});
