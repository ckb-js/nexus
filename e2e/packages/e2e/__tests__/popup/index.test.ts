import { expectedThrow, failedTestScreenshot, injectionTestStatus, step } from '../util';
import { launchWithNexus } from '../../src/setup/launch';
import { setUpNexus } from '../../src/setup/setup';
import { NEXUS_BUILD_PATH, NEXUS_WEB_LOCAL_URL, NEXUS_WEB_URL, PASS_WORD, USER_NAME } from '../config/config';
import { NexusWallet } from '../../src/types';
import {
  clickAdd,
  clickAddNetwork,
  clickBack,
  clickNetwork,
  clickSiteRemoveByIdx,
  clickWhitelistSites,
  getConnectedStatus,
  getSiteList,
  inputName,
  inputSiteSearch,
  inputUrl,
  urlTransferDomainName,
} from '../../src/nexus/helper/popup';
import { clickConnect } from '../../src/nexus/helper/notification';
import { wallet_enable, wallet_fullOwnership_getLiveCells, WalletEnableResponse } from '../../src/nexus/servicer/rpc';
import { BrowserContext, Page } from 'playwright';

injectionTestStatus();
describe('popup', function () {
  let browser: BrowserContext;
  let nexusWallet: NexusWallet;
  let page: Page;

  beforeAll(async () => {
    browser = await launchWithNexus({ nexusPath: NEXUS_BUILD_PATH });

    nexusWallet = await setUpNexus(browser, {
      mock: true,
      userName: USER_NAME,
      // seed: MNEMONIC,
      passwd: PASS_WORD,
    });
  });
  beforeEach(async () => {
    page = await nexusWallet.popup.getNewPage();
  });

  it(`query user name is equal UserName:${USER_NAME}`, async () => {
    await step(`query userName#userName should eq:${USER_NAME}`, async () => {
      await step(`get UserName eq:${USER_NAME} `, async () => {
        await page.getByText(USER_NAME).innerText();
      });
    });
  });
  it('the web site is not connected => query connection status is Disconnected', async () => {
    let connected: string;
    await step('query connected status', async () => {
      connected = await getConnectedStatus(page, 'Disconnected');
    });
    await step('statues should Disconnected', async () => {
      expect(connected).toBe('Disconnected');
    });
  });
  it('connect to a web site => query connection status is connected, and when it is closed => it is Disconnected', async () => {
    let newPage: Page;
    await step('go to new web:', async () => {
      newPage = await browser.newPage();
      await newPage.goto('https://map.baidu.com/');
    });
    await step('playwright connected web use injected js', async () => {
      await Promise.all([wallet_enable(newPage), nexusWallet.connect()]);
    });
    await step('query connected status should connected', async () => {
      const connectedStatus = await getConnectedStatus(page, 'Connected');
      expect(connectedStatus).toBe('Connected');
    });
    await step('close open new page', async () => {
      await newPage.close();
    });
    await step('query connected status should Disconnected', async () => {
      await page.reload();
      const connectedStatus = await getConnectedStatus(page, 'Disconnected');
      expect(connectedStatus).toBe('Disconnected');
    });
  });

  it(' click whitelist-sites => successful', async () => {
    await step('click whitelist-sites', async () => {
      await clickWhitelistSites(page);
    });
  });
  it('could click network  => successful', async () => {
    await step('click network', async () => {
      await clickNetwork(page);
    });
  });
  describe('whitelist-sites', function () {
    beforeEach(async () => {
      await clickWhitelistSites(page);
    });

    let notExistUrl = 'https://pudge.explorer.nervos.org/';
    test.each([
      { url: notExistUrl }, //  add white list that it is first
      { url: NEXUS_WEB_LOCAL_URL }, // local url
      { url: 'http://info.cern.ch/' }, // http
      {
        url: 'https://godwoken-bridge-testnet.vercel.app/#/v1/deposit/pending?sadasdasdasdasdasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndasdandawndiowafnoawhfaoihfoaihfioawhfoia=aaa',
      }, // long url
    ])(`add white :%s`, async ({ url }) => {
      let newPage: Page;
      await step('check url in whitelist,if exist ,remove it', async () => {
        await nexusWallet.popup.removeWhitelistBySearch(urlTransferDomainName(url));
      });
      await step(`goto url:${url}`, async () => {
        newPage = await browser.newPage();
        await newPage.goto(url);
      });
      await step('send ckb.enable,and approve', async () => {
        await Promise.all([wallet_enable(newPage), nexusWallet.connect()]);
      });
      await step('wallet_fullOwnership_getLiveCells enable', async () => {
        await newPage.bringToFront();
        await wallet_fullOwnership_getLiveCells(newPage, {
          cursor:
            '99:0x409bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce801dafb7ea1dd60616fb9e9088332e5f975a68ac28e000000000082a3220000000700000000',
          change: 'internal',
        });
        await newPage.close();
      });

      await step('bringToFront nexus:pop', async () => {
        await page.bringToFront();
      });
      await step('go to whiteList ', async () => {
        await page.reload();
      });
      await step(`query whitelist,url:${url} should exist`, async () => {
        await getSiteList(page, [url]);
      });
    });

    it('On the webpage that is on the whitelist, click "enable" => auto approval ,without requiring approval.', async () => {
      let urls: string[];
      let whiteUrl: string = '';
      await step('add white url', async () => {});
      await step('get url from white list', async () => {
        urls = await nexusWallet.popup.queryWhitelist();
        if (urls.length < 1) {
          throw Error(' white list is empty ');
        }
        whiteUrl = urls[0];
      });
      let newPage: Page;
      await step(`goto white web:${whiteUrl}`, async () => {
        newPage = await browser.newPage();
        if (whiteUrl.includes('localhost')) {
          await newPage.goto(`http://${whiteUrl}`);
        } else {
          await newPage.goto(`https://${whiteUrl}`);
        }
      });
      await step('send ckb.enable', async () => {
        await Promise.all([wallet_enable(newPage), nexusWallet.connect()]);
      });
      await step('reload web', async () => {
        await newPage.reload();
      });
      let ret: WalletEnableResponse;
      await step('send ckb.enable again', async () => {
        ret = await wallet_enable(newPage);
      });
      await step('check enable success', async () => {
        expect(ret.nickname).toContain(USER_NAME);
      });
      await step('close newPage', async () => {
        await newPage.close();
      });
    });
    it('remove whitelist => remove successful', async () => {
      const willDelUrl = 'http://localhost:3000/';
      await step(`add url:${willDelUrl} to whiteList`, async () => {
        const urls = await nexusWallet.popup.queryWhitelist();
        if (!urls.some((url) => url === urlTransferDomainName(willDelUrl))) {
          //todo add url to whiteList
          await addWhiteListByUrl(browser, nexusWallet, willDelUrl);
        }
      });
      await step('click whitelist', async () => {
        await page.bringToFront();
      });
      await step(`search ${willDelUrl} in white list`, async () => {
        await inputSiteSearch(page, urlTransferDomainName(willDelUrl));
      });
      let afterSiteList: string[];
      await step(`query ${willDelUrl} in site list`, async () => {
        await getSiteList(page, [willDelUrl]);
      });

      await step('remove query site url', async () => {
        await clickSiteRemoveByIdx(page, 0);
      });
      await step('search site list again', async () => {
        afterSiteList = await getSiteList(page);
      });
      await step(`query result should empty`, async () => {
        expect(afterSiteList[0]).toBe(undefined);
      });

      await step('close page', async () => {
        await page.close();
      });

      let localPage: Page;
      await step(`go to will del url:${willDelUrl}`, async () => {
        localPage = await browser.newPage();
        await localPage.goto(willDelUrl);
      });

      await step('click connect', async () => {
        await localPage.click('#connectButton');
      });

      await step('get notion page', async () => {
        page = await nexusWallet.getNotificationPage();
      });
      await step('click connect again', async () => {
        await clickConnect(page);
      });
      await step('check connect status', async () => {
        await localPage.getByText('linked').innerText();
      });
      await step('query whitelist', async () => {
        let list = await nexusWallet.popup.queryWhitelist();
        expect(list).toContain(urlTransferDomainName(willDelUrl));
      });
    });
    it('search whiteList ,could search it', async () => {
      let whiteUrls: string[] = [];
      await step('get white site list', async () => {
        whiteUrls = await nexusWallet.popup.queryWhitelist();
      });
      for (let i = 0; i < whiteUrls.length; i++) {
        let url = whiteUrls[i];
        await step('page bright', async () => {
          await page.bringToFront();
        });
        await step(`search url:${url}`, async () => {
          await inputSiteSearch(page, url);
        });
        await step(`check query response is eq:${url}`, async () => {
          let urls = await getSiteList(page);
          expect(urls).toContain(url);
          expect(urls.length).toBe(1);
        });
        await step(`clean search`, async () => {
          await page.reload();
        });
      }
    });
    it('click back => successful', async () => {
      await step('check url  contains:whitelist', async () => {
        expect(page.url()).toContain('whitelist');
      });
      await step('click back', async () => {
        await clickBack(page);
      });
      await step('check url not contains:whitelist', async () => {
        console.log(page.url());
        expect(page.url()).not.toContain('whitelist');
      });
    });
    it("When connecting to a whitelist webpage, remove the white url=>rpc can't use and connectStatus is Disconnected", async () => {
      const url = NEXUS_WEB_URL;
      let newPage: Page;
      await step('goto new web:', async () => {
        newPage = await browser.newPage();
        await newPage.goto(url);
      });

      await step('link web', async () => {
        await newPage.click('#connectButton');
        await nexusWallet.connect();
      });

      await step('check connectStatus status is  connected ', async () => {
        expect(await nexusWallet.popup.queryConnected()).toBe(true);
      });
      await step('remove web in whitelist', async () => {
        await nexusWallet.popup.removeWhitelistBySearch(urlTransferDomainName(url));
      });

      // await step("check network is enabled", async () => {
      //   //todo
      //
      // })
      await step(' check wallet_fullOwnership_getLiveCells is not enable', async () => {
        await newPage.bringToFront();

        await expectedThrow(
          wallet_fullOwnership_getLiveCells(newPage, {
            cursor:
              '99:0x409bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce801dafb7ea1dd60616fb9e9088332e5f975a68ac28e000000000082a3220000000700000000',
            change: 'internal',
          }),
          'not in the whitelist',
        );
      });
      await step('check connectStatus status is Disconnected ', async () => {
        expect(await nexusWallet.popup.queryConnected()).toBe(false);
      });
    });
  });
  describe('network', function () {
    beforeEach(async () => {
      await step('click network', async () => {
        await clickNetwork(page);
      });
    });
    it('click back  => success', async () => {
      await step('page url contains network', async () => {
        expect(page.url()).toContain('network');
      });
      await step('click back', async () => {
        await clickBack(page);
      });
      await step('page url not contains network', async () => {
        expect(page.url()).not.toContain('network');
      });
    });
    describe('add can use network', function () {
      test.each([
        {
          name: 'nework为中文特殊符号', // network为中文
          url: 'https://testnet.ckb.dev/', // http
        },
        {
          name: 'nework为🧧中文特殊符号', // network为中文
          url: 'https://testnet.ckb.dev/', // http
        },
        {
          name: '1234', //数字
          url: 'https://testnet.ckb.dev/',
        },
        {
          name: 'longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong',
          url: 'https://testnet.ckb.dev/',
        },
      ])('%s', async ({ name, url }) => {
        await step('click addNetwork', async () => {
          await clickAddNetwork(page);
        });
        await step(`input name :${name}`, async () => {
          await inputName(page, name);
        });
        await step(`input url :${url}`, async () => {
          await inputUrl(page, url);
        });
        await step('click add', async () => {
          await clickAdd(page);
        });
        await step(`check name:${name} in network lists`, async () => {
          const networkList = await nexusWallet.popup.queryNetworkList();
          expect(networkList).toContain(name);
        });
      });
    });
    it('add networkName that exist =>add success', async () => {
      let queryNetworkList: string[] = [];
      await step('query network list', async () => {
        queryNetworkList = await nexusWallet.popup.queryNetworkList();
      });
      let addNetworkName = queryNetworkList[0];
      await step(`add network use  Name:${addNetworkName} that is exist`, async () => {
        await nexusWallet.popup.addNetwork({
          name: addNetworkName,
          url: 'https://testnet.ckb.dev/',
        });
      });
    });
    it('add ckb url that not provide ckb service', async () => {
      let addOpt = {
        name: 'add ckb url that not provide ckb service',
        url: 'https://www.baidu.com',
      };
      await step('add network', async () => {
        await nexusWallet.popup.addNetwork(addOpt);
      });
      await step('check add name in  network list ', async () => {
        //todo check add should failed
        const list = await nexusWallet.popup.queryNetworkList();
        expect(list).toContain(addOpt.name);
      });
    });
    it('add url that is http', async () => {
      let addOpt = {
        name: 'htt url',
        url: 'http://info.cern.ch/',
      };
      await step('add network', async () => {
        await nexusWallet.popup.addNetwork(addOpt);
      });
      await step('check add is success ', async () => {
        const list = await nexusWallet.popup.queryNetworkList();
        expect(list).toContain(addOpt.name);
      });
    });
    it('add network that url is localhost link', async () => {
      let addOpt = {
        name: 'test1',
        url: 'http://localhost:3000',
      };
      await step('add network', async () => {
        await nexusWallet.popup.addNetwork(addOpt);
      });
      await step('check add is success ', async () => {
        //todo check add should failed
        const list = await nexusWallet.popup.queryNetworkList();
        expect(list).toContain(addOpt.name);
      });
    });
    it("add network that can't use", async () => {
      let addOpt = {
        name: "can't use",
        url: 'http://localhost:4000',
      };
      await step('add network', async () => {
        await nexusWallet.popup.addNetwork(addOpt);
      });
      await step('check add is success ', async () => {
        //todo check add should failed
        const list = await nexusWallet.popup.queryNetworkList();
        expect(list).toContain(addOpt.name);
      });
    });
    it('change network that is same network', async () => {
      let newPage: Page;
      let addTestNetOpt = {
        name: 'testCkbNet>?>?<><><><><>>>>????>>>',
        url: 'https://testnet.ckb.dev/',
      };
      await step('add test net', async () => {
        await nexusWallet.popup.addNetwork(addTestNetOpt);
      });
      await step(`goto nexus web:${NEXUS_WEB_URL}`, async () => {
        newPage = await browser.newPage();
        await newPage.goto(NEXUS_WEB_URL);
      });
      await step('click connectButton', async () => {
        await newPage.click('#connectButton');
      });
      await step('connected web', async () => {
        await nexusWallet.connect();
      });
      await step('get network response', async () => {
        await newPage.locator('#networkNameResponse').innerText();
      });
      await step(`change network:${addTestNetOpt.name}`, async () => {
        await nexusWallet.popup.changeNetworkByName(addTestNetOpt.name);
      });

      await step('get network response', async () => {
        await newPage.getByText(addTestNetOpt.name).innerText();
      });
    });
    it('change different network', async () => {
      let newPage: Page;
      await step(`change network:ckb test `, async () => {
        // await nexusWallet.popup.changeNetworkByName(addTestNetOpt.name)
        await nexusWallet.popup.changeNetworkByName('Testnet');
      });
      await step(`goto nexus web:${NEXUS_WEB_URL}`, async () => {
        newPage = await browser.newPage();
        await newPage.goto(NEXUS_WEB_URL);
      });
      await step('click connectButton', async () => {
        await newPage.click('#connectButton');
      });
      await step('connected web', async () => {
        await nexusWallet.connect();
      });

      let beforeNetworkResponse: string;
      await step('get network response', async () => {
        beforeNetworkResponse = await newPage.locator('#networkNameResponse').innerText();
      });
      await step(`change network:Ckb `, async () => {
        // await nexusWallet.popup.changeNetworkByName(addTestNetOpt.name)
        await nexusWallet.popup.changeNetworkByName('Mainnet');
      });
      let afterChangeNetworkResponse: string;
      await step('get network response', async () => {
        afterChangeNetworkResponse = await newPage.locator('#networkNameResponse').innerText();
      });

      await step('not eq ', async () => {
        expect(beforeNetworkResponse).not.toBe(afterChangeNetworkResponse);
      });
    });
    it('change to bad url', async () => {
      await step('add bad url', async () => {
        await nexusWallet.popup.addNetwork({
          name: 'bad url',
          url: 'http://localhost/9001',
        });
      });
      let nexusWebPage: Page;
      await step(`goto nexus web:${NEXUS_WEB_URL}`, async () => {
        nexusWebPage = await browser.newPage();
        await nexusWebPage.goto(NEXUS_WEB_URL);
      });
      await step('connect ', async () => {
        await nexusWebPage.click('#connectButton');
        await nexusWallet.connect();
      });

      await step('change the network that url is  bad ', async () => {
        await nexusWallet.popup.changeNetworkByName('bad url');
      });
      await step('get network response', async () => {
        await nexusWebPage.bringToFront();
        await nexusWebPage.getByText('bad url').first();
      });
    });
    it.skip('remove current not link network', async () => {
      //todo
    });
    it.skip('remove current link network', async () => {
      //todo
    });
  });

  afterEach(async () => {
    await failedTestScreenshot(browser);
    const pages = browser.pages();
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].url() === 'about:blank') {
        continue;
      }
      await pages[i].close();
    }
  });
  afterAll(async () => {
    await browser.close();
  });
});

async function addWhiteListByUrl(browserContext: BrowserContext, nexus: NexusWallet, url: string) {
  const page = await browserContext.newPage();
  await page.goto(url);
  await Promise.all([wallet_enable(page), nexus.connect()]);
  await page.close();
}
