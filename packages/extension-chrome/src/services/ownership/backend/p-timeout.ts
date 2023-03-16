//@ts-nocheck
/* istanbul ignore next */
export class TimeoutError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
An error to be thrown when the request is aborted by AbortController.
DOMException is thrown instead of this Error when DOMException is available.
*/
/* istanbul ignore next */
export class AbortError extends Error {
  constructor(message: string) {
    super();
    this.name = 'AbortError';
    this.message = message;
  }
}

/**
TODO: Remove AbortError and just throw DOMException when targeting Node 18.
*/
/* istanbul ignore next */
const getDOMException = (errorMessage: string) =>
  globalThis.DOMException === undefined ? new AbortError(errorMessage) : new DOMException(errorMessage);

/**
TODO: Remove below function and just 'reject(signal.reason)' when targeting Node 18.
*/
/* istanbul ignore next */
const getAbortedReason = (signal) => {
  const reason = signal.reason === undefined ? getDOMException('This operation was aborted.') : signal.reason;

  return reason instanceof Error ? reason : getDOMException(reason);
};

/* istanbul ignore next */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export default function pTimeout<T>(promise: Promise<T>, options: any): Promise<T> {
  const { milliseconds, fallback, message, customTimers = { setTimeout, clearTimeout } } = options;

  let timer;

  const cancelablePromise = new Promise((resolve, reject) => {
    if (typeof milliseconds !== 'number' || Math.sign(milliseconds) !== 1) {
      throw new TypeError(`Expected \`milliseconds\` to be a positive number, got \`${milliseconds}\``);
    }

    if (milliseconds === Number.POSITIVE_INFINITY) {
      resolve(promise);
      return;
    }

    if (options.signal) {
      const { signal } = options;
      if (signal.aborted) {
        reject(getAbortedReason(signal));
      }

      signal.addEventListener('abort', () => {
        reject(getAbortedReason(signal));
      });
    }

    // We create the error outside of `setTimeout` to preserve the stack trace.
    const timeoutError = new TimeoutError();

    timer = customTimers.setTimeout.call(
      undefined,
      () => {
        if (fallback) {
          try {
            resolve(fallback());
          } catch (error) {
            reject(error);
          }

          return;
        }

        if (typeof promise.cancel === 'function') {
          promise.cancel();
        }

        if (message === false) {
          resolve();
        } else if (message instanceof Error) {
          reject(message);
        } else {
          timeoutError.message = message ?? `Promise timed out after ${milliseconds} milliseconds`;
          reject(timeoutError);
        }
      },
      milliseconds,
    );

    void (async () => {
      try {
        resolve(await promise);
      } catch (error) {
        reject(error);
      } finally {
        customTimers.clearTimeout.call(undefined, timer);
      }
    })();
  });

  cancelablePromise.clear = () => {
    customTimers.clearTimeout.call(undefined, timer);
    timer = undefined;
  };

  return cancelablePromise;
}
