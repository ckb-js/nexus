import { useEvent } from 'react-use';

// TODO: wait for implementation
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useHostMessageListener() {
  return useEvent('message', () => {
    //
  });
}
