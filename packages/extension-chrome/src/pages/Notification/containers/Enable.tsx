import React, { useEffect, useState } from 'react';
import { Button, Flex, Heading, Spacer, Text } from '@chakra-ui/react';
import browser from 'webextension-polyfill';

export const Enable: React.FC = () => {
  const [requesterUrl, setRequesterUrl] = useState<string>();

  useEffect(() => {
    (async () => {
      const res = await browser.runtime.sendMessage({ method: 'getRequesterAppInfo' });
      setRequesterUrl(res.url);
    })();
  }, []);

  // if (!requesterUrl) return <h1>waiting...</h1>;

  return (
    <Flex direction="column" h="100%" paddingY="16px" paddingX="32px">
      <Heading>Connect Request </Heading>
      <Text>Allow {requesterUrl} to: see used locks, unused locks, activity and suggest transactions to approve</Text>

      <Spacer />
      <Button
        onClick={async () => {
          await browser.runtime.sendMessage({ method: 'userHasEnabledWallet' });
          window.close();
        }}
      >
        Approve
      </Button>
    </Flex>
  );
};
