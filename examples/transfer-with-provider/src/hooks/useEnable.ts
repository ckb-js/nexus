import { useProvider } from './useProvider';
import { useAsyncState } from './useAsyncState';

export function useEnable(): string | undefined {
  const provider = useProvider();
  return useAsyncState(async () => {
    const res = await provider.enable();
    return res.nickname;
  }, [provider]);
}
