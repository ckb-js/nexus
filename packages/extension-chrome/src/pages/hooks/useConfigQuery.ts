import { Config } from '@nexus-wallet/types/lib/services';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { createServicesFactory } from '../../services';

export function useConfigQuery(): UseQueryResult<Config, unknown> {
  const configService = createServicesFactory().get('configService');

  return useQuery({
    queryKey: ['config'],
    queryFn: async () => configService.getConfig(),
  });
}
