/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserContext } from 'playwright';
import { exec } from 'child_process';
import { createHash } from 'crypto';

declare const reporter: any;

export interface StepInterface {
  parameter(name: string, value: string): void;

  name(name: string): void;
}

export async function story(name: string, body: () => any): Promise<void> {
  // await allure.story(name)
  await wrap(body)();
}

export async function setCommitHashToReport(): Promise<void> {
  const hash = await getCurrentCommitHash();
  await reporter.addEnvironment('NEXUS COMMIT', hash);
}

function getCurrentCommitHash(): Promise<string> {
  return new Promise((resolve, reject) => {
    exec('git rev-parse HEAD', (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        const commitHash = stdout.trim();
        resolve(commitHash);
      }
    });
  });
}

export async function step(name: string, body: () => any): Promise<void> {
  await reporter.startStep(name);
  await wrap(body)();
  await reporter.endStep('passed');
}

function wrap<T>(fun: (...args: any[]) => T): any {
  return (...args: any[]): T => {
    let result;
    try {
      result = fun(args);
    } catch (error) {
      throw error;
    }
    if (isPromise(result)) {
      const promise = result as any as Promise<any>;
      return promise
        .then((res) => {
          return res;
        })
        .catch((error) => {
          if (error) {
          }
          throw error;
        }) as any as T;
    } else {
      return result;
    }
  };
}

const isPromise = (obj: any): boolean =>
  !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';

/**
 * a way to get test status in afterEach() method
 * https://github.com/facebook/jest/issues/5292#issuecomment-648884859
 */
export function injectionTestStatus(): void {
  // @ts-ignore
  jasmine.getEnv().addReporter({
    // @ts-ignore
    specStarted: (result) => {
      // eslint-disable-next-line no-undef
      // @ts-ignore
      jasmine.currentTest = result;
    },
  });
}

/**
 * get test status from method: injectionTestStatus
 */
export async function failedTestScreenshot(browser: BrowserContext): Promise<void> {
  // @ts-ignore
  const suit = jasmine.currentTest;
  if (suit.failedExpectations.length <= 0) {
    // There has been a failure.
    return;
  }
  // eslint-disable-next-line no-console
  console.warn(`failedTestScreenshot case :${suit.fullName}`);
  for (let i = 0; i < browser.pages().length; i++) {
    if (browser.pages()[i].url() === 'about:blank') {
      console.log('skip about:blank');
      continue;
    }
    const currentPage = browser.pages()[i];
    const picName = hashString(suit.fullName);
    try {
      const ret = await currentPage.screenshot({
        fullPage: true,
        path: `allure-results/${picName}-${i}.png`,
      });
      attachJpeg(`allure-results/${picName}-${i}`, ret);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`failedTestScreenshot failed , page url:${currentPage.url()}`);
    }
  }
}

function hashString(str: string): string {
  const md5Hash = createHash('md5');
  md5Hash.update(str);
  return md5Hash.digest('hex');
}

export function attachJpeg(name: string, content: Buffer | string): void {
  try {
    reporter.addAttachment(name, content, 'image/jpeg');
  } catch (TypeError) {
    // @ts-ignore
    if (TypeError.toString().includes("Cannot read properties of undefined (reading 'attachment')")) {
      return;
    }
    throw TypeError;
  }
}

export function getBrowserRandomUserPath(): string {
  return `tmp/${getRandomStr()}`;
}

export function getRandomStr(): string {
  return Math.random().toString(36).slice(-10);
}

export async function expectedThrow(promise: Promise<any>, msg = ''): Promise<void> {
  try {
    await promise;
    // Fail test if above expression doesn't throw anything.
    expect(true).toBe(false);
  } catch (e) {
    // @ts-ignore
    expect(e.message).toContain(msg);
  }
}
