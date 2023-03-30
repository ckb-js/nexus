import { makeAutoObservable } from 'mobx';

export class InjectedCkbService {
  enableStatus = false;
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

  get ckbWalletVersion() {
    return window.ckb.version;
  }

  wallet_enable = async () => {
    try {
      this.nicknameResponse = JSON.stringify(await window.ckb.request({ method: 'wallet_enable' }));
    } catch (e) {
      this.nicknameResponse = `${e}`;
      return;
    }
    this.enableStatus = true;
    await window.ckb.on('networkChanged', (networkName) => {
      console.log(networkName);
      this.networkNameResponse = networkName;
    });
  };

  wallet_fullOwnership_getLiveCells = async (params) => {
    try {
      this.fullOwnershipGetLiveCellsResponse = JSON.stringify(
        await window.ckb.request({
          method: 'wallet_fullOwnership_getLiveCells',
          params: JSON.parse(params),
        }),
      );
    } catch (e) {
      this.fullOwnershipGetLiveCellsResponse = `${e}`;
    }
  };

  wallet_fullOwnership_getOffChainLocks = async (params) => {
    try {
      this.fullOwnershipGetOffChainLocksResponse = JSON.stringify(
        await window.ckb.request({
          method: 'wallet_fullOwnership_getOffChainLocks',
          params: JSON.parse(params),
        }),
      );
    } catch (e) {
      this.fullOwnershipGetOffChainLocksResponse = `${e}`;
    }
  };
  wallet_fullOwnership_getOnChainLocks = async (params) => {
    try {
      this.fullOwnershipGetOnChainLocksResponse = JSON.stringify(
        await window.ckb.request({
          method: 'wallet_fullOwnership_getOnChainLocks',
          params: JSON.parse(params),
        }),
      );
    } catch (e) {
      this.fullOwnershipGetOnChainLocksResponse = `${e}`;
    }
  };
  wallet_fullOwnership_signData = async (params) => {
    try {
      this.walletFullOwnershipSignDataResponse = JSON.stringify(
        await window.ckb.request({
          method: 'wallet_fullOwnership_signData',
          params: JSON.parse(params),
        }),
      );
    } catch (e) {
      this.walletFullOwnershipSignDataResponse = `${e}`;
    }
  };

  wallet_fullOwnership_signTransaction = async (params) => {
    try {
      this.walletFullOwnershipSignTransactionResponse = JSON.stringify(
        await window.ckb.request({
          method: 'wallet_fullOwnership_signTransaction',
          params: JSON.parse(params),
        }),
      );
    } catch (e) {
      this.walletFullOwnershipSignTransactionResponse = `${e}`;
    }
  };

  ckb_request = async (method, params) => {
    try {
      this.ckbRequestResponse = JSON.stringify(
        await window.ckb.request({
          method: method,
          params: JSON.parse(params),
        }),
      );
    } catch (e) {
      this.ckbRequestResponse = `${e}`;
    }
  };
}
