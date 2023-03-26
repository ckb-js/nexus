import { makeAutoObservable } from 'mobx';

export class InjectedCkbService {
  enableStatus = false;
  ckbProvider;
  walletVersion = '';
  networkNameResponse = '';
  nicknameResponse = '';
  fullOwnershipGetLiveCellsResponse = '';
  fullOwnershipGetOnChainLocksResponse = '';
  fullOwnershipGetOffChainLocksResponse = '';
  walletFullOwnershipSignTransactionResponse = '';
  walletFullOwnershipSignDataResponse = '';
  ckbRequestResponse = '';
  constructor() {
    makeAutoObservable(this);
  }

  enable = async () => {
    this.ckbProvider = await window.ckb.enable();
    this.enableStatus = true;
    await window.ckb.on('networkChanged', (networkName) => {
      console.log(networkName);
      this.networkNameResponse = networkName;
    });
  };

  isEnable = async () => {
    this.enableStatus = await window.ckb.isEnabled();
  };

  get ckbVersion() {
    return window.ckb.version;
  }

  wallet_enable = async () => {
    this.nicknameResponse = JSON.stringify(await window.ckb.request({ method: 'wallet_enable' }));
    this.enableStatus = true;
    await window.ckb.on('networkChanged', (networkName) => {
      console.log(networkName);
      this.networkNameResponse = networkName;
    });
  };

  wallet_fullOwnership_getLiveCells = async (params) => {
    this.fullOwnershipGetLiveCellsResponse = JSON.stringify(
      await window.ckb.request({
        method: 'wallet_fullOwnership_getLiveCells',
        params: JSON.parse(params),
      }),
    );
  };

  wallet_fullOwnership_getOffChainLocks = async (params) => {
    this.fullOwnershipGetOffChainLocksResponse = JSON.stringify(
      await window.ckb.request({
        method: 'wallet_fullOwnership_getOffChainLocks',
        params: JSON.parse(params),
      }),
    );
  };
  wallet_fullOwnership_getOnChainLocks = async (params) => {
    this.fullOwnershipGetOnChainLocksResponse = JSON.stringify(
      await window.ckb.request({
        method: 'wallet_fullOwnership_getOnChainLocks',
        params: JSON.parse(params),
      }),
    );
  };
  wallet_fullOwnership_signData = async (params) => {
    this.walletFullOwnershipSignDataResponse = JSON.stringify(
      await window.ckb.request({
        method: 'wallet_fullOwnership_signData',
        params: JSON.parse(params),
      }),
    );
  };

  wallet_fullOwnership_signTransaction = async (params) => {
    this.walletFullOwnershipSignTransactionResponse = JSON.stringify(
      await window.ckb.request({
        method: 'wallet_fullOwnership_signTransaction',
        params: JSON.parse(params),
      }),
    );
  };

  ckb_request = async (method, params) => {
    this.ckbRequestResponse = JSON.stringify(
      await window.ckb.request({
        method: method,
        params: JSON.parse(params),
      }),
    );
  };
}
