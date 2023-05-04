import { nanoid } from 'nanoid';
import download from 'download';
import { ChildProcess, execSync, spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import detectPort from 'detect-port';
import TOML from '@ltd/j-toml';
import { lock as _lock, Options as LockOptions, unlock as _unlock } from 'lockfile';
import { HttpsProxyAgent } from 'hpagent';
import envPaths, { Paths } from 'env-paths';
import { createLogger } from '@nexus-wallet/utils';
import random from 'lodash.random';
import { Logger } from '@nexus-wallet/utils/lib/logger';

const ARCH_MAP: Record<string, string | undefined> = {
  x64: 'x86_64',
  arm64: 'aarch64',
};

const PLATFORM_MAP: Record<string, string | undefined> = {
  darwin: 'apple-darwin',
  linux: 'unknown-linux-gnu',
  win32: 'pc-windows-msvc',
};

interface DownloadOptions {
  version?: string;
  persistPath?: string;
  logger?: Logger;
}

const DEFAULT_CKB_CONFIG_PATH = path.resolve(__dirname, '../misc/ckbNode');

function lock(path: string, options: LockOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    _lock(path, options, (err) => (err ? reject(err) : resolve()));
  });
}

function unlock(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    _unlock(path, (err) => (err ? reject(err) : resolve()));
  });
}

async function downloadCkbBinary({
  persistPath = CkbNode.paths.cache,
  version = 'v0.109.0',
  logger = createLogger('CkbNode'),
}: DownloadOptions) {
  if (process.env.CKB_BIN_PATH) {
    return process.env.CKB_BIN_PATH;
  }

  persistPath = path.join(persistPath, 'releases');

  const targetPath = path.resolve(persistPath, version);

  const arch = ARCH_MAP[os.arch()];
  if (!arch) {
    throw new Error(`Unsupported arch: ${os.arch()}`);
  }
  const platform = PLATFORM_MAP[os.platform()];
  if (!platform) {
    throw new Error(`Unsupported platform: ${os.platform()}`);
  }

  const fileExt = os.platform() === 'linux' ? 'tar.gz' : 'zip';
  const filename = `ckb_${version}_${arch}-${platform}-portable`;

  const downloadUrl = `https://github.com/nervosnetwork/ckb/releases/download/${version}/${filename}.${fileExt}`;

  if (!(await fs.exists(targetPath))) {
    await fs.mkdir(targetPath, { recursive: true });
  }
  const lockPath = path.resolve(targetPath, 'ckb.lock');

  try {
    await lock(lockPath, { wait: 200_000, stale: 600_000 });
  } catch (e) {
    throw new Error(`Can not get lock\n. Move ${lockPath} may solve this problem`);
  }

  try {
    if (await fs.exists(path.resolve(targetPath, `ckb${os.platform() === 'win32' ? '.exe' : ''}`))) {
      logger.info(`CKB ${version} already exists, skip download.`);
    } else {
      logger.info(`Download CKB ${version} from ${downloadUrl} to ${targetPath} with proxy: `, process.env.https_proxy);
      await download(downloadUrl, targetPath, {
        extract: true,
        // strip leading value
        strip: 1,
        // from:
        // https://github.com/delvedor/hpagent#got
        // https://github.com/kevva/download#proxies
        agent: process.env.https_proxy
          ? new HttpsProxyAgent({
              proxy: process.env.https_proxy,
            })
          : false,
      });
    }
  } finally {
    await unlock(lockPath);
  }

  return path.resolve(targetPath, os.platform() === 'win32' ? 'ckb.exe' : 'ckb');
}

function updateToml(path: string, modifier: (toml: Record<string, any>) => void) {
  const raw = fs.readFileSync(path, 'utf-8');
  const toml: Record<string, any> = TOML.parse(raw);

  modifier(toml);
  fs.writeFileSync(path, TOML.stringify(toml, { newline: '\n' }));
}

type CkbNodeConfig = {
  /**
   * CKB version @default 'v0.109.0'
   */
  version: string;
  /**
   * CKB block data path
   * @default
   */
  blockDataPath: string;
  cleanAfterStop: boolean;
  // minerDuration?: number;
  // assemblerArgs?: string;
};

export type Options = Partial<CkbNodeConfig> & { logger?: Logger };

export class CkbNode {
  private readonly config: CkbNodeConfig;
  private logger: Logger;

  private binaryDir?: string;
  private ckbProcess?: ChildProcess;
  private minerProcess?: ChildProcess;
  private running = false;
  private id = nanoid();
  private port = random(10000, 60000);

  private constructor(options: Options) {
    this.config = {
      version: options.version ?? 'v0.109.0',
      cleanAfterStop: options.cleanAfterStop ?? true,
      blockDataPath: path.join(options.blockDataPath || CkbNode.paths.data, this.id),
    };

    this.logger = options.logger ?? createLogger('CkbNode');
  }

  get issuedCellPrivateKeys(): string[] {
    return [
      '0xfd686a48908e8caf97723578bf85f746e1e1d8956cb132f6a2e92e7234a2a245',
      '0x5368b818f59570b5bc078a6a564f098a191dcb8938d95c413be5065fd6c42d32',
      '0xd6013cd867d286ef84cc300ac6546013837df2b06c9f53c83b4c33c2417f6a07',
    ];
  }

  get issuedCellAddresses(): string[] {
    return [
      'ckt1qyqw8yx5hx6vwcm7eqren0d0v39wvfwdhy3q2807pp',
      'ckt1qyqtdhd6s7a44a0s2wc6uk7tcl6duq68nalqvzxw09',
      'ckt1qyqxek9w28u3htxhjyqjd7yqzw9nptzaxq2shqlft0',
    ];
  }

  private get rpcAddress(): string {
    return `127.0.0.1:${this.port}`;
  }

  get rpcUrl(): string {
    return `http://${this.rpcAddress}`;
  }

  private get configPaths() {
    return {
      'ckb.toml': path.resolve(this.config.blockDataPath, 'ckb.toml'),
      'ckb-miner.toml': path.resolve(this.config.blockDataPath, 'ckb-miner.toml'),
      'dev.toml': path.resolve(this.config.blockDataPath, 'specs', 'dev.toml'),
    };
  }

  private async init() {
    const { version } = this.config;
    this.binaryDir = await downloadCkbBinary({ version });
    execSync(`${this.binaryDir} init -C "${this.config.blockDataPath}" --chain dev --force`);
    await fs.copy(DEFAULT_CKB_CONFIG_PATH, this.config.blockDataPath, { overwrite: true });
  }

  /**
   * Start the CKB Node
   */
  async start(): Promise<string> {
    if (this.running) {
      console.warn('CKB node is already running, skip start.');
      return this.rpcAddress;
    }

    this.port = await detectPort(this.port);
    updateToml(this.configPaths['ckb.toml'], (ckb) => {
      ckb.rpc.listen_address = this.rpcAddress;
      ckb.data_dir = this.config.blockDataPath;
    });
    updateToml(this.configPaths['ckb-miner.toml'], (ckbMiner) => {
      ckbMiner.miner.client.rpc_url = this.rpcUrl;
    });

    const startMiner = () => {
      this.minerProcess = spawn(this.binaryDir!, ['miner', '-C', this.config.blockDataPath]);
      this.minerProcess.stdout?.on('data', (data) => {
        data = data.toString();
        this.logger.debug('Miner: ', data);
      });
      this.minerProcess.stderr?.on('data', (data) => {
        data = data.toString();
        this.logger.error('Miner: ', data);
      });
      this.minerProcess.on('exit', (code) => {
        this.logger.info('Miner exit at:', code || 0);
      });
    };

    return new Promise((resolve) => {
      this.ckbProcess = spawn(this.binaryDir!, ['run', '-C', this.config.blockDataPath, '--indexer']);
      this.running = true;
      this.ckbProcess.stdout?.on('data', (data) => {
        data = data.toString();
        this.logger.debug('Node: ', data);
        if (data.includes('Listen HTTP RPCServer on address 127.0.0.1')) {
          startMiner();
          resolve(this.rpcUrl);
        }
      });
      this.ckbProcess.stderr?.on('data', (data) => {
        this.logger.error('Node: ', data.toString());
      });
      this.ckbProcess.addListener('exit', (code) => {
        this.logger.info('CKB node exited: ', code || 0);
        this.running = false;
      });
    });
  }

  async stop(keepData = false): Promise<number> {
    if (!this.running) {
      return Promise.resolve(0);
    }
    return new Promise((resolve) => {
      this.ckbProcess?.on('close', (code) => {
        this.ckbProcess?.removeAllListeners();
        this.ckbProcess?.stderr?.removeAllListeners();
        this.ckbProcess?.stdout?.removeAllListeners();
        this.minerProcess?.removeAllListeners();
        this.minerProcess?.stderr?.removeAllListeners();
        this.minerProcess?.stdout?.removeAllListeners();

        if (!keepData && this.config.cleanAfterStop) {
          void this.clean();
        }
        resolve(code || 0);
      });

      this.minerProcess?.kill();
      this.ckbProcess?.kill();
      this.running = false;
    });
  }

  clean(): Promise<void> {
    return fs.rm(this.config.blockDataPath, { recursive: true });
  }

  private static instanceMap = new Map<string, CkbNode>();

  static async create(options: Options = {}): Promise<CkbNode> {
    const instance = new CkbNode(options);
    await instance.init();
    CkbNode.instanceMap.set(instance.id, instance);
    return instance;
  }

  static async stopAll(): Promise<void> {
    for (const instance of CkbNode.instanceMap.values()) {
      await instance.stop();
    }
  }

  static paths: Paths = envPaths('ckb');
}
