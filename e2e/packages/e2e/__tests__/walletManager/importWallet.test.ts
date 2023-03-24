import { clickImportWallet, inputMnemonic } from '../../src/nexus/helper/importWallet';
import { BrowserContext, Page } from 'playwright';
import { launchWithNexus } from '../../src/setup/launch';
import { getExtensionId } from '../../src/setup/setup';
import { getExtensionPageByUrl } from '../../src/nexus';
import { NexusUrl } from '../../src/nexus/const';
import { expectedThrow, failedTestScreenshot, getBrowserRandomUserPath, injectionTestStatus, step } from '../util';
import {
  clickBack,
  clickDone,
  clickNext,
  inputConfirmPassword,
  inputPassword,
  inputUserName,
} from '../../src/nexus/helper/walletManager';
import { NEXUS_BUILD_PATH } from '../config/config';

injectionTestStatus();
describe('importWallet', function () {
  let browser: BrowserContext;
  let extensionId;
  let page: Page;
  const seeds = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
  const passwd = '12345678';
  const userName = 'xm';

  beforeEach(async () => {
    browser = await launchWithNexus(
      {
        nexusPath: NEXUS_BUILD_PATH,
      },
      getBrowserRandomUserPath(),
    );
    browser.setDefaultTimeout(10000);
    extensionId = await getExtensionId(browser);
    page = await getExtensionPageByUrl(browser, extensionId, NexusUrl.walletManager);
  });

  it('#1 Correct mnemonic phrase input # account import success ', async () => {
    await step('click import wallet', async () => {
      await clickImportWallet(page);
    });
    await step(`input seed:${seeds}`, async () => {
      await inputMnemonic(page, seeds);
    });
    await step('click next', async () => {
      await clickNext(page);
    });
    await step(`input passwd:${passwd}`, async () => {
      await inputPassword(page, passwd);
    });
    await step(`input confirm passwd:${passwd}`, async () => {
      await inputConfirmPassword(page, passwd);
    });
    await step('click next', async () => {
      await clickNext(page);
    });
    await step(`input UserName:${userName}`, async () => {
      await inputUserName(page, userName);
    });
    await step('click next', async () => {
      await clickNext(page);
    });
    await step('click all done', async () => {
      await clickDone(page);
    });
  });

  describe('import/seed', function () {
    beforeEach(async () => {
      await clickImportWallet(page);
    });

    it('#1 Mnemonic phrase contains repeated words => unable to import mnemonic phrase', async () => {
      const replace_mn = 'abandon abandon able about above absent absorb abstract absurd abuse access accident';
      await step(`input mnemonic:${replace_mn}`, async () => {
        await inputMnemonic(page, replace_mn);
      });
      await step('click next', async () => {
        await expectedThrow(clickNext(page));
      });
    });
    it('#2 Mnemonic phrase contains number => unable to import mnemonic phrase', async () => {
      const replace_mn = '1234 abandon able about above absent absorb abstract absurd abuse access accident';
      await step(`input mnemonic:${replace_mn}`, async () => {
        await inputMnemonic(page, replace_mn);
      });
      await step('click next', async () => {
        await expectedThrow(clickNext(page));
      });
    });
    it('#3 Mnemonic phrase contains special characters => unable to import mnemonic phrase', async () => {
      const replace_mn = '%7k🆚 abandon able about above absent absorb abstract absurd abuse access accident';
      await step(`input mnemonic:${replace_mn}`, async () => {
        await inputMnemonic(page, replace_mn);
      });
      await step('click next', async () => {
        await expectedThrow(clickNext(page));
      });
    });
    it('#4 Words outside of the word list https://github.com/bitcoin/bips/blob/master/bip-0039/english.txt => unable to import', async () => {
      const replace_mn = 'adasdahiuhif finite doze dog pat team seek pink punch scale clap computer';
      await step(`input mnemonic:${replace_mn}`, async () => {
        await inputMnemonic(page, replace_mn);
      });
      await step('click next', async () => {
        await expectedThrow(clickNext(page));
      });
    });
    it('#5 Click back => return success', async () => {
      await step('click back', async () => {
        await clickBack(page);
      });
    });
    it('#6 Click next before finishing input => click failed', async () => {
      await step('click next', async () => {
        await expectedThrow(clickNext(page));
      });
    });
    describe('import/password', function () {
      beforeEach(async () => {
        await inputMnemonic(page, seeds);
        await clickNext(page);
      });
      it('#1 Password input is less than 8 characters, click next => click failed', async () => {
        const passwd = '1234';
        await step(`input passwd:${passwd}`, async () => {
          await inputPassword(page, passwd);
        });
        await step(`input confirm passwd:${passwd}`, async () => {
          await inputConfirmPassword(page, passwd);
        });
        await step('click next', async () => {
          await expectedThrow(clickNext(page));
        });
      });
      const passwdArr = ['中文12345678', '👋👋👋👋👋👋👋👋👋👋👋'];
      for (let i = 0; i < passwdArr.length; i++) {
        it.skip(`#2-${i} input password:${passwdArr[i]}=> error`, async () => {
          await step(`input passwd:${passwdArr[i]}`, async () => {
            await inputPassword(page, passwdArr[i]);
          });
          await step(`input confirm passwd:${passwdArr[i]}`, async () => {
            await inputConfirmPassword(page, passwdArr[i]);
          });
          await step('click next', async () => {
            await expectedThrow(clickNext(page));
          });
        });
      }
      it('#3 Input password does not match confirmation password => unable to click continue ', async () => {
        const passwd = '12341231231231';
        const confirmPasswd = '21312312313';
        await step(`input passwd:${passwd}`, async () => {
          await inputPassword(page, passwd);
        });
        await step(`input confirm passwd:${confirmPasswd}`, async () => {
          await inputConfirmPassword(page, confirmPasswd);
        });
        await step('click next', async () => {
          await expectedThrow(clickNext(page));
        });
      });

      it('#4 Click continue without inputting password => unable to click continue', async () => {
        await step('click next', async () => {
          await expectedThrow(clickNext(page));
        });
      });
      describe('import/account', function () {
        beforeEach(async () => {
          await inputPassword(page, passwd);
          await inputConfirmPassword(page, passwd);
          await clickNext(page);
        });
        it('#1 Click continue without inputting username => unable to click continue', async () => {
          await step('click next', async () => {
            await expectedThrow(clickNext(page));
          });
        });

        it('#2 Click back without inputting username => return success', async () => {
          await step('click back', async () => {
            await clickBack(page);
          });
        });
        let userNameArrs = [''];
        for (let i = 0; i < userNameArrs.length; i++) {
          const userName = userNameArrs[i];

          it.skip(`#3-${i} Username contains special characters, Chinese characters, emojis, etc.:${userName} => error`, async () => {
            await step(`input user name:${userName}`, async () => {
              await inputUserName(page, userName);
            });
          });
        }
        it.skip('#4 Username input is too long => length restriction\n', async () => {
          let userNameL =
            '123213123123123213132131232131313131313112321312312312321313213123213131313131311232131231231232131321312321313131313131';
          await step(`input user name:${userNameL}`, async () => {
            await inputUserName(page, userNameL);
          });
        });
      });
    });
  });
  afterEach(async () => {
    await failedTestScreenshot(browser);
    await browser.close();
  });
});
