import { NexusLaunchOptions } from '../types';

import { chromium } from 'playwright-core';
import { BrowserContext } from 'playwright';
import { PreloadJsContext } from '../nexus/servicer/provider';

export async function launchWithNexus(option: NexusLaunchOptions, userDataDir = 'tmp/nexus'): Promise<BrowserContext> {
  console.log(`userDataDir:${userDataDir}`);
  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [`--disable-extensions-except=${option.nexusPath}`, `--load-extension=${option.nexusPath}`],
    permissions: ['clipboard-read'],
    slowMo: 10,
    // // recordVideo: {
    // //     dir: 'videos/',
    // //     size: { width: 640, height: 480 },
    // // }
    ...option.playwrightOptions,
  });
  await browserContext.addInitScript({ content: PreloadJsContext });
  browserContext.setDefaultTimeout(10000);
  return browserContext;
}
