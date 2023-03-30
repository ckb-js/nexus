import React, { useMemo } from 'react';
import { Box, Button, ButtonGroup, Flex, Skeleton, VStack } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { useQuery } from '@tanstack/react-query';

import { ConnectStatusCard } from '../../Components/ConnectStatusCard';
import { WhiteAlphaBox } from '../../Components/WhiteAlphaBox';
import { useSessionMessenger } from '../../hooks/useSessionMessenger';
import { useConfigQuery } from '../../hooks/useConfigQuery';
import { SiteFavicon } from '../../Components/SiteFavicon';

export const Grant: React.FC = () => {
  const messenger = useSessionMessenger();
  const requestAppInfoQuery = useQuery({
    queryKey: ['session_getRequesterAppInfo', messenger.sessionId()] as const,
    queryFn: () => messenger.send('session_getRequesterAppInfo'),
  });

  const configQuery = useConfigQuery();

  const url = useMemo(() => {
    if (!requestAppInfoQuery.data?.url) return null;
    const url = new URL(requestAppInfoQuery.data?.url);
    return url;
  }, [requestAppInfoQuery.data?.url]);

  const permissions = ['View your addresses', 'Request approval for transactions'];

  return (
    <Skeleton colorScheme="purple" isLoaded={!requestAppInfoQuery.isLoading && !configQuery.isLoading}>
      <ConnectStatusCard name={configQuery.data?.nickname!} />

      <Flex py="32px" alignItems="center" direction="column">
        <SiteFavicon data-test-id="requester.favicon" mb="8px" host={url?.host!} size={40} />

        <Box fontSize="md" data-test-id="requester.url" fontWeight="semibold">
          {url?.hostname}
        </Box>
      </Flex>

      <Box w="452px" fontSize="md">
        This app would like to:
      </Box>

      <VStack my="8px" p="20px 30px" alignItems="flex-start" as={WhiteAlphaBox} spacing="12px">
        {permissions.map((p) => (
          <Flex key={p} fontSize="md" alignItems="center" fontWeight="semibold">
            <CheckCircleIcon w="24px" h="24px" mr="20px" color="green.300" />
            {p}
          </Flex>
        ))}
      </VStack>

      <Box w="452px" fontSize="16px">
        Only connect with sites you trust
      </Box>

      <ButtonGroup mt="32px" size="md">
        <Button data-test-id="cancel" onClick={() => window.close()} w="220px" color="gray.800" colorScheme="gray">
          Cancel
        </Button>

        <Button
          w="220px"
          data-test-id="connect"
          onClick={async () => {
            await messenger.send('session_approveEnableWallet');
            window.close();
          }}
        >
          Connect
        </Button>
      </ButtonGroup>
    </Skeleton>
  );
};
