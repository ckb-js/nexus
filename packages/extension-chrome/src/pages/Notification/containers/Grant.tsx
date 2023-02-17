import React, { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Flex, Image, VStack } from '@chakra-ui/react';
import { ConnectStatusCard } from '../../Components/ConnectStatusCard';
import { WhiteAlphaBox } from '../../Components/WhiteAlphaBox';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { useSessionMessenger } from '../../hooks/useSessionMessenger';

export const Grant: React.FC = () => {
  const [requesterUrl, setRequesterUrl] = useState<string>();
  const messenger = useSessionMessenger();
  useEffect(() => {
    void (async () => {
      const res = await messenger.send('session_getRequesterAppInfo');
      setRequesterUrl(res.url);
    })();
  }, [messenger]);

  const permissions = ['View your addresses', 'Request approval for transactions'];

  // only comment for debug
  // if (!requesterUrl) return <h1>waiting...</h1>;

  return (
    <>
      <ConnectStatusCard mt="44px" name="Yan" connected />

      <Flex py="32px" alignItems="center" direction="column">
        {/* TODO: wait implementation, the request website icon path should be provided in the future */}
        <Image
          data-test-id="requester.favicon"
          w="40px"
          mb="8px"
          h="40px"
          src="https://static.figma.com/app/icon/1/favicon.png"
        />

        <Box fontSize="md" data-test-id="requester.url" fontWeight="semibold">
          {requesterUrl}
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
    </>
  );
};
