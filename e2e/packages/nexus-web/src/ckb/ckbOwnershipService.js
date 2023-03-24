import { makeAutoObservable } from 'mobx';

class CkbOwnershipService {
  getLiveCellsResponse = '';
  getUnusedLocksResponse = '';
  getUsedLocksResponse = '';
  signDataResponse = '';

  constructor() {
    makeAutoObservable(this);
  }

  enable = async () => {
    this.enableStatus = true;
  };

  async getLiveCells(ckbOwnership, payload) {
    console.log('getLiveCells:', payload);
    this.getLiveCellsResponse = await ckbOwnership.getLiveCells(payload);
    // this.getLiveCellsResponse = "[" + this.getLiveCellsResponse + "]"
  }

  async getUnusedLocks(ckbOwnership, change) {
    this.getUnusedLocksResponse = await ckbOwnership.getUnusedLocks({ change: change });
  }

  async getUsedLocks(ckbOwnership, cursor) {
    this.getUsedLocksResponse = await ckbOwnership.getUsedLocks({ cursor: cursor });
  }

  async signTransaction(ckbOwnership, txStr) {
    this.signTransactionResponse = await ckbOwnership.signTransaction({ transaction: JSON.parse(txStr) });
  }

  async signData(ckbOwnership, payload) {
    payload = JSON.parse(payload);
    try {
      this.signDataResponse = await ckbOwnership.signData(payload);
    } catch (e) {
      this.signDataResponse = `${e}`;
    }
  }

  //   getUsedLocks(payload?: { cursor?: string }): Promise<Paginate<Script>>;
  //   getLiveCells(payload?: { cursor?: string }): Promise<Paginate<Cell>>;
  //   signTransaction(payload: { tx: Transaction }): Promise<GroupedSignature>;
  //
  //   /**
  //    * sign custom message
  //    */
  //   signData(payload: SignDataPayload): Promise<Signature>;
}

export { CkbOwnershipService };

// export interface Keyring {
//     getUnusedLocks(options?: GetUnusedLocksOptions): Promise<Script[]>;
//     getUsedLocks(payload?: { cursor?: string }): Promise<Paginate<Script>>;
//     getLiveCells(payload?: { cursor?: string }): Promise<Paginate<Cell>>;
//     signTransaction(payload: { tx: Transaction }): Promise<GroupedSignature>;
//
//     /**
//      * sign custom message
//      */
//     signData(payload: SignDataPayload): Promise<Signature>;
// }
