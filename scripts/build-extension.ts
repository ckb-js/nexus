import { Auto, IPlugin } from '@auto-it/core';
import { spawn } from 'child_process';

/**
 * This is a custom Auto plugin that builds the Nexus extension when `auto shipit` is run.
 */
export default class BuildExtension implements IPlugin {
  name = 'nexus-build-extension';

  apply(auto: Auto): void {
    auto.hooks.afterVersion.tapPromise(this.name, async () => {
      await this.buildNexusExtension(auto);
    });
    auto.hooks.canary.tapPromise(this.name, async () => {
      await this.buildNexusExtension(auto);
    });
  }

  private buildNexusExtension(auto: Auto): Promise<void> {
    const buildCommand = [
      // build Nexus libraries
      'npm run build:libs',
      // build Nexus extension
      'npm run build:extension-chrome',
      // zip Nexus extension into `packages/extension-chrome/nexus.zip`
      'npm run -w @nexus-wallet/extension-chrome zip',
    ].join(' && ');

    return new Promise((resolve, reject) => {
      const build = spawn(buildCommand, { shell: true });

      build.stdout.on('data', (data) => {
        auto.logger.verbose.info(data.toString());
      });

      build.stderr.on('data', (data) => {
        auto.logger.verbose.info(data.toString());
      });

      build.on('close', (code) => {
        auto.logger.log.info('Nexus extension built successfully.');

        if (code) {
          reject();
        } else {
          resolve();
        }
      });
    });
  }
}
