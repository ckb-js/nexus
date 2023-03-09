/**
 * a composite cursor that contains both the ckb-indexer cursor and the derived lock id
 */
export type CellCursor = {
  // {@link ScriptInfo.id}
  localId: number;
  // ckb indexer's cursor
  indexerCursor: string;
};

export function encodeCursor(decoded: CellCursor): string {
  return `${decoded.localId}:${decoded.indexerCursor}`;
}

export function decodeCursor(encoded: string): CellCursor {
  const [lockInfoId, indexerCursor] = encoded.split(':');
  return { localId: parseInt(lockInfoId), indexerCursor };
}
