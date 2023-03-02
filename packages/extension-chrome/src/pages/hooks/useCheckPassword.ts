import { useCallback } from 'react';
import { createServicesFactory } from '../../services';

export function useCheckPassword(): (password: string) => Promise<boolean> {
  const keystoreService = createServicesFactory().get('keystoreService');
  return useCallback(
    (password: string) => keystoreService.checkPassword({ password }) as Promise<boolean>,
    [keystoreService],
  );
}
