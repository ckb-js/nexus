import { launchWithNexus } from '../../src/setup/launch';
import { setUpNexus } from '../../src/setup/setup';
import { NexusWallet } from '../../src/types';
import { BrowserContext, Page } from 'playwright';
import { failedTestScreenshot, injectionTestStatus, step } from '../util';
import { MNEMONIC, NEXUS_BUILD_PATH, NEXUS_WEB_URL, PASS_WORD, USER_NAME } from '../config/config';

injectionTestStatus();
describe('nexus-e2e-web', function () {
  let browser: BrowserContext;
  let nexusWallet: NexusWallet;
  let page: Page;
  beforeAll(async () => {
    browser = await launchWithNexus({ nexusPath: NEXUS_BUILD_PATH });

    nexusWallet = await setUpNexus(browser, {
      mock: true,
      userName: USER_NAME,
      seed: MNEMONIC,
      passwd: PASS_WORD,
    });

    // link web
    page = await browser.newPage();
    await page.goto(NEXUS_WEB_URL, {});
    await page.click('#connectButton');

    let is2ndLinked: boolean;
    is2ndLinked = await page.locator('#connectButton').isDisabled({ timeout: 500 });
    if (!is2ndLinked) {
      await nexusWallet.connect();
    }
  });
  it('after the connection is successful, the "connectButton" button will change to a "close" state', async () => {
    await step(' click connectButton is disabled', async () => {
      await page.locator('#connectButton').isDisabled();
    });
  });

  describe('sign-Data', function () {
    test.each([
      {
        inputSignData: '{"data":"0x1234"}',
        expectedGetResponse: 'mooooock signed data',
      },
    ])(`signData test:%s`, async ({ inputSignData, expectedGetResponse }) => {
      await step(`input:${inputSignData}`, async () => {
        await page.locator(`#fullOwnership-signDataInput`).type(inputSignData);
      });
      await step('click signData', async () => {
        await page.locator(`#fullOwnership-signDataButton`).click();
      });

      await step(`nexus:click approve sign`, async () => {
        await nexusWallet.approve(PASS_WORD);
      });
      await step(`check response  == ${expectedGetResponse}`, async () => {
        const ret = await page.locator(`#fullOwnership-signDataResult`).innerText();
        expect(ret).toBe(expectedGetResponse);
      });
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
