import { launchWithNexus } from '../../src/setup/launch';
import { setUpNexus } from '../../src/setup/setup';
import { NexusWallet } from '../../src/types';
import { BrowserContext, Page } from 'playwright';
import { failedTestScreenshot, injectionTestStatus, step } from '../util';
import { MNEMONIC, NEXUS_BUILD_PATH, NEXUS_WEB_URL, PASS_WORD, USER_NAME } from '../config/config';
import { Sleep } from '../../src/nexus/util/helper';

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
        expectedGetResponse:
          '0xe83c69c774e3291af933db5b056bc69d91646b783588993ce8acbc0be6e0536b07e4f611d62511ab1b33424633c2935938cc7b1a9480d308f827510885c3816e01',
      },
    ])(`signData test:%s`, async ({ inputSignData, expectedGetResponse }) => {
      await step('input {}', async () => {
        await page.locator('#walletFullOwnershipGetOffChainLocksInput').type('{}');
      });
      await step(`get signLock`, async () => {
        //
        await page.locator('#walletFullOwnershipGetOffChainLocksButton').click();
      });
      let offChainResponse: string;
      await step('get OnChainLocks response', async () => {
        offChainResponse = await page.locator('#walletFullOwnershipGetOffChainLocksResponse').innerText();
      });
      let signMsg = '';
      await step('build sign Data with lock params', async () => {
        offChainResponse = JSON.parse(offChainResponse);
        const signMsgMap = JSON.parse(inputSignData);
        signMsgMap['lock'] = offChainResponse[0];
        signMsg = JSON.stringify(signMsgMap);
      });

      await step(`input:${signMsg}`, async () => {
        await page.locator(`#walletFullOwnershipSignDataInput`).type(signMsg);
      });
      await step('click signData', async () => {
        await page.locator(`#walletFullOwnershipSignDataButton`).click();
      });

      await step(`nexus:click approve sign`, async () => {
        await nexusWallet.approve(PASS_WORD);
      });
      await step(`check response  == ${expectedGetResponse}`, async () => {
        const ret = await getRpcResponse(page, `#walletFullOwnershipSignDataResponse`);
        expect(ret).toContain(expectedGetResponse);
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

async function getRpcResponse(page: Page, selector: string): Promise<string> {
  for (let i = 0; i < 5; i++) {
    if ((await page.locator(selector).innerText()) === '') {
      await Sleep(1000);
      continue;
    }
    break;
  }
  return (await page.locator(selector).innerText()).replace('\\"', '');
}
