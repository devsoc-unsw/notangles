import TimeoutError from '../interfaces/TimeoutError';

/**
 * @param ms How many milliseconds to reject the promise after
 * @param promise The promise to execute
 * @returns A promise that is rejected after some time has elapsed
 */
const timeoutPromise = (ms: number, promise: Promise<Response>) => {
  return new Promise<Response>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new TimeoutError('timeout'));
    }, ms);

    promise.then(
      (res) => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
};

export default timeoutPromise;
