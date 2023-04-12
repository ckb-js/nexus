import * as deprecatedAsserts from './asserts';
import * as deprecatedErrors from './error';

export { LIB_VERSION } from './env';
export { unimplemented, throwError } from './error';
export { assert } from './asserts';
export { resolveValue, formatMessage } from './internal';
export { createLogger } from './logger';
export { asyncSleep } from './asyncSleep';

/**
 * @deprecated use `assert(condition, ...)` instead
 */
export const asserts = deprecatedAsserts;

/**
 * @deprecated use `throwError(...)` instead
 */
export const errors = deprecatedErrors;
