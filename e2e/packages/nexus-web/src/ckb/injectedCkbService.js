import { makeAutoObservable } from 'mobx';

export class InjectedCkbService {
  enableStatus = false;
  ckbProvider;
  walletVersion = '';
  networkNameResponse = '';
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
  getNetworkName = async (ckb) => {
    this.networkNameResponse = await ckb.getNetworkName();
  };
}
