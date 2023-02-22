import { Base64 as base64 } from 'js-base64';
export interface LockCursor {
  parentPath: string;
  index: number;
}

export interface LiveCellCursor extends LockCursor {
  indexerCursor: string;
}

export class DefaultLockCursor implements LockCursor {
  constructor(public parentPath: string, public index: number) {}

  static fromString(cursor: string): DefaultLockCursor {
    const str = JSON.parse(base64.decode(cursor));
    const [parentPath, index] = str.split(':');
    return new DefaultLockCursor(parentPath, parseInt(index));
  }

  encode(): string {
    return base64.encode(JSON.stringify(`${this.parentPath}:${this.index}`));
  }
}

export class DefaultLiveCellCursor implements LiveCellCursor {
  constructor(public parentPath: string, public index: number, public indexerCursor: string) {}

  static fromString(cursor: string): DefaultLiveCellCursor {
    const str = JSON.parse(base64.decode(cursor));
    const [parentPath, index, indexerCursor] = str.split(':');
    return new DefaultLiveCellCursor(parentPath, parseInt(index), indexerCursor);
  }

  encode(): string {
    return base64.encode(JSON.stringify(`${this.parentPath}:${this.index}:${this.indexerCursor}`));
  }
}
