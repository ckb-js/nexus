import React, { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Flex, Image, VStack } from '@chakra-ui/react';
import browser from 'webextension-polyfill';
import { ConnectStatusCard } from '../../Components/ConnectStatusCard';
import { WhiteAlphaBox } from '../../Components/WhiteAlphaBox';
import { CheckCircleIcon } from '@chakra-ui/icons';

export const Grant: React.FC = () => {
  const [requesterUrl, setRequesterUrl] = useState<string>();

  useEffect(() => {
    (async () => {
      const res = await browser.runtime.sendMessage({ method: 'getRequesterAppInfo' });
      setRequesterUrl(res.url);
    })();
  }, []);

  const permissions = ['View your addresses', 'Request approval for transactions'];

  // only comment for debug
  // if (!requesterUrl) return <h1>waiting...</h1>;

  return (
    <>
      <ConnectStatusCard mt="44px" name="Yan" connected />

      <Flex py="32px" alignItems="center" direction="column">
        {/* TODO: wait implementation, the request website icon path should be provided in the future */}
        <Image w="40px" mb="8px" h="40px" src="https://static.figma.com/app/icon/1/favicon.png" />

        <Box fontSize="md" fontWeight="semibold">
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
        <Button onClick={() => window.close()} w="220px" color="gray.800" colorScheme="gray">
          Cancel
        </Button>

        <Button
          w="220px"
          onClick={async () => {
            await browser.runtime.sendMessage({ method: 'userHasEnabledWallet' });
            window.close();
          }}
        >
          Connect
        </Button>
      </ButtonGroup>
    </>
  );
};
