import { NexusLaunchOptions } from '../types';

import { chromium } from 'playwright-core';
import { BrowserContext } from 'playwright';

export async function launchWithNexus(option: NexusLaunchOptions, userDataDir = 'tmp/nexus'): Promise<BrowserContext> {
  console.log(`userDataDir:${userDataDir}`);
  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [`--disable-extensions-except=${option.nexusPath}`, `--load-extension=${option.nexusPath}`],
    permissions: ['clipboard-read'],
    slowMo: 10,
    ...option.playwrightOptions,
  });
  browserContext.setDefaultTimeout(10000);
  return browserContext;
}
