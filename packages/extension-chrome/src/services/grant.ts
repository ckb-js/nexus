import { GrantService, Storage } from '@nexus-wallet/types';
import { errors } from '@nexus-wallet/utils';

export function createGrantService(payload: { storage: Storage<{ grant: string[] }> }): GrantService {
  const { storage } = payload;

  return {
    async getIsGranted(payload) {
      const grantedUrls = await storage.getItem('grant');
      if (!grantedUrls) return false;
      return grantedUrls.includes(payload.host);
    },
    async grant(payload) {
      const grantedUrls = await storage.getItem('grant');
      if (!grantedUrls) {
        errors.throwError('Storage is not initialized');
      }
      grantedUrls.push(payload.host);
      await storage.setItem('grant', grantedUrls);
    },
  };
}
