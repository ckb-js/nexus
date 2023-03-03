import { Config } from '@nexus-wallet/types/lib/services';
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useService } from './useService';

export function useConfigQuery(): UseQueryResult<Config, unknown> & { invalidate: () => Promise<void> } {
  const configService = useService('configService');
  const queryClient = useQueryClient();

  return {
    ...useQuery({
      queryKey: ['config'],
      queryFn: async () => configService.getConfig(),
    }),
    invalidate: () => queryClient.invalidateQueries(['config']),
  };
}
