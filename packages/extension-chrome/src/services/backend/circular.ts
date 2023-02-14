import { asserts } from '@nexus-wallet/utils';
import { LockInfo } from './types';
import { LinkedList, Node } from './linkedList';
import isEqual from 'lodash/isEqual';

export interface Circular<T> {
  readonly items: LinkedList<T>;
  readonly pointer: Node<T> | null;

  current(): T | undefined;
  next(): T | undefined;
  takeAndSupply(take: number | T, newItem: T): T;
}

export class CircularOffChainLockInfo implements Circular<LockInfo> {
  items: LinkedList<LockInfo>;
  pointer: Node<LockInfo> | null;
  storageUpdator: (items: LockInfo[]) => Promise<void>;
  pointerUpdator: (pointer: LockInfo | null) => Promise<void>;

  constructor(payload: {
    items: LockInfo[];
    pointer: LockInfo | null;
    storageUpdator: (items: LockInfo[]) => Promise<void>;
    pointerUpdator: (pointer: LockInfo | null) => Promise<void>;
  }) {
    const list = new LinkedList<LockInfo>(payload.items);
    this.items = list;
    this.pointer = payload.pointer ? list.search((data) => isEqual(data, payload.pointer)) : null;
    this.storageUpdator = payload.storageUpdator;
    this.pointerUpdator = payload.pointerUpdator;
  }

  current(): LockInfo | undefined {
    return this.pointer?.data;
  }
  takeAndSupply(take: number | LockInfo, newItem: LockInfo): LockInfo {
    let targetNode: Node<LockInfo> | null = null;
    if (typeof take === 'number') {
      targetNode = this.items.search((data) => data.index === take);
    } else {
      targetNode = this.items.search((data) => isEqual(data, take));
    }
    asserts.asserts(targetNode, 'targetNode should not be empty when calling takeAndSupply', take);
    !targetNode.data.onchain && this.items.insertAtEnd(newItem);
    targetNode.data.onchain = true;
    this.storageUpdator(this.items.traverse());
    return newItem;
  }
  next(): LockInfo | undefined {
    const next = this.pointer?.next || this.items.headNode;
    if (next) {
      this.pointer = next;
      this.pointerUpdator(this.pointer.data);
      return next.data;
    }
    this.pointerUpdator(null);
    return undefined;
  }
}
