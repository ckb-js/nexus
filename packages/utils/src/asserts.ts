import { throwError } from './error';

export function nonEmpty(x: unknown): asserts x {
  if (x === '' || x === null || x === undefined) throwError('cannot be empty');
}

export function nonFalsy(x: unknown): asserts x {
  nonEmpty(x);

  if (!x) throwError('cannot be falsy');
}
