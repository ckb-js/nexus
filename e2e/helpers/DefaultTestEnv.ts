import { BrowserContext, chromium, Page } from 'playwright';
import { InjectedCkb, RpcMethods } from '@nexus-wallet/protocol';
import { errors, LIB_VERSION } from '@nexus-wallet/utils';
import { NEXUS_BUILD_PATH, PERSISTENT_PATH } from '../constants';
import path from 'path';
import { getDefaultStorageData } from './storage';

export interface TestEnv {
  context: BrowserContext;
  extensionId: string;

  /**
   * Get the injected ckb object
   * @param page - If not provided, the last page in the context will be used
   */
  getInjectedCkb(page?: Page): InjectedCkb<RpcMethods>;

  getNotificationPage(): Promise<Page | undefined>;

  approveForEnable(page?: Page): Promise<void>;

  dispose(): Promise<void>;

  defaultE2eData: {
    localServerUrl: string;
    nickname: string;
    mnemonic: string;
    password: string;
  };
}

interface Options {
  headless?: boolean;
  /**
   * when true, the wallet_enable request will be auto approved
   */
  autoApproveEnable?: boolean;
  /**
   * init wallet with default data
   */
  initWalletWithDefaults?: boolean;

  extensionDirPath?: string;
  persistentDirPath?: string;
}

declare global {
  interface Window {
    ckb: InjectedCkb;
  }

  const testEnv: DefaultTestEnv;
  const page: Page;
  const ckb: InjectedCkb<RpcMethods>;
}

export class DefaultTestEnv implements TestEnv {
  /**
   * Setup the test environment, a `testEnv` object will be injected into the global scope.
   * should be called in the test file
   * @param options
   */
  static setupTest(options: Options = {}): void {
    let testEnv: DefaultTestEnv;

    beforeEach(async () => {
      testEnv = new DefaultTestEnv(options);
      await testEnv.init();

      const page = await testEnv.context.newPage();
      await page.goto(testEnv.defaultE2eData.localServerUrl);
      const ckb = await testEnv.getInjectedCkb(page);

      Object.assign(global, { testEnv, page, ckb });
    });

    afterEach(async () => {
      await testEnv.dispose();
    });
  }

  defaultE2eData: TestEnv['defaultE2eData'] = {
    // TODO: this should be a local server
    localServerUrl: 'https://github.com',
    nickname: 'Nexus Dev',
    mnemonic: 'abandon abandon able about above absent absorb abstract absurd abuse access accident',
    password: '12345678',
  };

  // public readonly context: BrowserContext;
  private readonly options: Required<Options>;

  private _context: BrowserContext | undefined;
  private _extensionId: string | undefined;

  constructor(options: Options = {}) {
    this.options = {
      headless: options.headless ?? process.env.HEADLESS === 'true',
      autoApproveEnable: options.autoApproveEnable ?? false,
      initWalletWithDefaults: options.initWalletWithDefaults ?? false,
      extensionDirPath: options.extensionDirPath ?? NEXUS_BUILD_PATH,
      persistentDirPath: options.persistentDirPath ?? PERSISTENT_PATH,
    };
  }

  get context(): BrowserContext {
    if (!this._context) {
      throw new Error('TestEnv not initialized');
    }
    return this._context;
  }

  get extensionId(): string {
    if (!this._extensionId) {
      throw new Error('TestEnv not initialized');
    }
    return this._extensionId;
  }

  async init(): Promise<void> {
    const persistentPath = path.join(this.options.persistentDirPath, Date.now().toString());
    this._context = await chromium.launchPersistentContext(persistentPath, {
      headless: this.options.headless,
      slowMo: 10,
      args: [
        ...(this.options.headless ? ['--headless=new'] : []),
        `--disable-extensions-except=${this.options.extensionDirPath}`,
        `--load-extension=${this.options.extensionDirPath}`,
      ],
      permissions: ['clipboard-read'],
    });
    this._context.setDefaultTimeout(5000);

    let [background] = this.context.serviceWorkers();
    if (!background) background = await this.context.waitForEvent('serviceworker');
    this._extensionId = background.url().split('/')[2];

    if (this.options.initWalletWithDefaults) {
      // wait for the extension storage to be ready
      await asyncSleep(200);

      await background.evaluate(async (data) => {
        await chrome.storage.local.set(data as Record<string, any>);
      }, getDefaultStorageData());
    }
  }

  private async findPage({ predicate }: { predicate: (page: Page) => boolean }): Promise<Page | undefined> {
    const pages = this.context.pages();
    let target = pages.find(predicate);
    if (!target) {
      target = await this.context.waitForEvent('page', { predicate });
    }

    return target;
  }

  async getNotificationPage(): Promise<Page> {
    const notificationPage = await this.findPage({
      predicate: (page) => page.url().includes('notification.html'),
    });
    if (!notificationPage) {
      throw new Error('Notification page not found');
    }

    return notificationPage;
  }

  async approveForEnable(page?: Page): Promise<void> {
    const notificationPage = page ?? (await this.getNotificationPage());

    const button = await notificationPage.getByRole('button', { name: 'Connect' });
    await button.click();
  }

  getInjectedCkb(page?: Page): InjectedCkb<RpcMethods> {
    const pages = this.context.pages();
    const thePage = page ?? pages[pages.length - 1];

    if (!thePage) throw new Error('The page is required');

    const ckb: InjectedCkb = {
      // TODO: fetch this from window.ckb
      version: LIB_VERSION,
      request: async (payload) => {
        const res = thePage.evaluate(async (payload) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return window.ckb.request(payload as never);
        }, payload);

        if (this.options.autoApproveEnable && payload.method === 'wallet_enable') {
          await this.approveForEnable();
        }

        return await res;
      },

      on: errors.unimplemented,
      removeListener: errors.unimplemented,
    };

    return ckb;
  }

  dispose(): Promise<void> {
    return this.context.close();
  }
}

async function asyncSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
