import { launchWithNexus } from '../../src/setup/launch';
import { BrowserContext, Page } from 'playwright';
import { getExtensionId } from '../../src/setup/setup';
import { getExtensionPageByUrl } from '../../src/nexus';
import { NexusUrl } from '../../src/nexus/const';

import { expectedThrow, failedTestScreenshot, getBrowserRandomUserPath, injectionTestStatus, step } from '../util';
import {
  clickClipboardAndGet,
  clickCreateNewWallet,
  fullCheckSeeds,
  getSeeds,
} from '../../src/nexus/helper/createANewWallet';
import {
  clickBack,
  clickDone,
  clickGetStarted,
  clickNext,
  inputConfirmPassword,
  inputPassword,
  inputUserName,
} from '../../src/nexus/helper/walletManager';
import { clickConfirm } from '../../src/nexus/helper/importWallet';
import { NEXUS_BUILD_PATH } from '../config/config';

injectionTestStatus();
describe('create a wallet', function () {
  let browser: BrowserContext;
  let extensionId;
  let page: Page;
  const password = '1234567890123456';
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

  describe('create/account', function () {
    beforeEach(async () => {
      await clickCreateNewWallet(page);
      await clickGetStarted(page);
    });

    it('#1 If username is not entered, clicking "next" => unable to next', async () => {
      await step('click next', async () => {
        await expectedThrow(clickNext(page));
      });
    });

    it('#2 If username is not entered, clicking "back" => return successful', async () => {
      await step('click back', async () => {
        await clickBack(page);
      });
    });
    it('#3 If the entered username contains special characters, Chinese characters, emojis, etc. => error message', async () => {
      //todo   get nick name by rpc  after create account
      let userNameArrs = ['😊溪秀', '中文'];
      for (let i = 0; i < userNameArrs.length; i++) {
        const userName = userNameArrs[i];
        await step(`input user name:${userName}`, async () => {
          await inputUserName(page, userName);
        });
      }
    });
    it.skip('#4 If the entered username is too long => length limit', async () => {
      let userNameL =
        '123213123123123213132131232131313131313112321312312312321313213123213131313131311232131231231232131321312321313131313131';
      await step(`input user name:${userNameL}`, async () => {
        await inputUserName(page, userNameL);
      });
    });
    describe('create/password', function () {
      beforeEach(async () => {
        await step('input userName', async () => {
          await inputUserName(page, userName);
        });
        await step('click next', async () => {
          await clickNext(page);
        });
      });

      it('#1 If the password is less than 8 characters ,click "next" => can\'t click', async () => {
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
      test.each([{ passwd: '中文中文中文中文中文中文中文' }, { passwd: '🆕🆕🆕🆕🆕🆕🆕🆕🆕🆕🆕' }])(
        `#2 Entered password:%s =>error message`,
        async ({ passwd }) => {
          await step(`input passwd: ${passwd}`, async () => {
            await inputPassword(page, passwd);
          });
          await step(`input confirm passwd:${passwd}`, async () => {
            await inputConfirmPassword(page, passwd);
          });
          await step('click next', async () => {
            await expectedThrow(clickNext(page));
          });
        },
      );

      it('#3 If the entered password and confirmation password do not match => unable to continue', async () => {
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
      describe('create/seed', function () {
        beforeEach(async () => {
          await step(`input passwd:${password}`, async () => {
            await inputPassword(page, password);
          });
          await step(`input confirm passwd:${password}`, async () => {
            await inputConfirmPassword(page, password);
          });

          await step('click next', async () => {
            await clickNext(page);
          });
        });
        it('#1 Clipboard matches the text in the box', async () => {
          let clipboardSeeds: string[];
          let boxSeeds: string[];
          await step('get seeds by clipboard', async () => {
            clipboardSeeds = (await clickClipboardAndGet(page)).split(' ');
          });
          await step('get seeds by box', async () => {
            boxSeeds = await getSeeds(page);
          });
          await step(`compare seeds clipboardSeeds and boxSeeds`, async () => {
            expect(clipboardSeeds).toEqual(boxSeeds);
          });
        });
        it('#2 Clicking "back" => successful', async () => {
          await step('click back', async () => {
            await clickBack(page);
          });
        });
        it('#3 CLicking next=> successful', async () => {
          await step('click next', async () => {
            await clickNext(page);
          });
        });
        describe('create/confirm', function () {
          let seeds: string[];
          beforeEach(async () => {
            seeds = await getSeeds(page);
            await clickNext(page);
          });
          it('#1 If the input sequence is not consistent with the previous inputs => unable to click "confirm"', async () => {
            const seed1 = seeds.sort();
            await step(`input seeds not eq:${seed1}`, async () => {
              await step(`click order:${seed1}`, async () => {
                await fullCheckSeeds(page, seed1);
              });
            });
            await step('click confirm', async () => {
              await expectedThrow(clickConfirm(page));
            });
          });
          it('#2 Entering an incorrect sequence can be canceled and the correct sequence entered', async () => {
            const seed1 = seeds.slice(0, 4);
            const seed2 = seeds.slice(4, seeds.length);
            await step(`click order :${seed2}`, async () => {
              await fullCheckSeeds(page, seed2);
            });
            await step(`click order :${seed2}`, async () => {
              await fullCheckSeeds(page, seed2);
            });

            await step(`click order :${seed1}`, async () => {
              await fullCheckSeeds(page, seed1);
            });
            await step(`click order:${seed2}`, async () => {
              await fullCheckSeeds(page, seed2);
            });
            await step('click confirm', async () => {
              await clickConfirm(page);
            });
          });
          it('#3 After entering the correct sequence, clicking "confirm" is possible', async () => {
            await step(`click order:${seeds}`, async () => {
              await fullCheckSeeds(page, seeds);
            });
            await step('click confirm', async () => {
              await clickConfirm(page);
            });
          });
        });
      });
    });
  });

  it('#1 Account Creation Process # Successful Account Creation', async () => {
    // click create a new wallet
    let seedArr: string[];
    await step('click CreateNewWallet button', async () => {
      await clickCreateNewWallet(page);
    });
    await step('click get start', async () => {
      await clickGetStarted(page);
    });
    await step(`input user name:${userName}`, async () => {
      await inputUserName(page, userName);
    });

    await step('click next', async () => {
      await clickNext(page);
    });
    await step(`input passwd:${password}`, async () => {
      await inputPassword(page, password);
    });
    await step(`input confirm passwd:${password}`, async () => {
      await inputConfirmPassword(page, password);
    });

    await step('click next', async () => {
      await clickNext(page);
    });
    await step('click `copy to clipboard`', async () => {
      seedArr = (await clickClipboardAndGet(page)).split(' ');
    });
    await step('click next', async () => {
      await clickNext(page);
    });
    await step('click seeds', async () => {
      await fullCheckSeeds(page, seedArr);
    });
    await step('click confirm', async () => {
      await clickConfirm(page);
    });
    await step('click `all Done`', async () => {
      await clickDone(page);
    });
  });

  afterEach(async () => {
    await failedTestScreenshot(browser);
    await browser.close();
  });
});
