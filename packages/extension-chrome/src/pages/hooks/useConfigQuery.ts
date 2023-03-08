import { Config } from '@nexus-wallet/types/lib/services';
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useService } from './useService';

type QueryResultWithInvalidate = UseQueryResult<Config, unknown> & { invalidate: () => Promise<void> };

export function useConfigQuery(): QueryResultWithInvalidate {
  const configService = useService('configService');
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['config'],
    queryFn: async () => configService.getConfig(),
  });

  (query as unknown as { invalidate: () => Promise<void> }).invalidate = () =>
    queryClient.invalidateQueries(['config']);

  return query as QueryResultWithInvalidate;
}
