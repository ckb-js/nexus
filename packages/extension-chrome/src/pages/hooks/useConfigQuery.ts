import { Config } from '@nexus-wallet/types/lib/services';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useService } from './useService';

export function useConfigQuery(): UseQueryResult<Config, unknown> {
  const configService = useService('configService');

  return useQuery({
    queryKey: ['config'],
    queryFn: async () => configService.getConfig(),
  });
}
