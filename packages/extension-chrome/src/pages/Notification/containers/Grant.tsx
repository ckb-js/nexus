import React, { useEffect, useState } from 'react';
import { Button, Flex, Heading, Spacer, Text } from '@chakra-ui/react';
import { useSessionMessenger } from '../../hooks/useSessionMessenger';

export const Grant: React.FC = () => {
  const [requesterUrl, setRequesterUrl] = useState<string>();
  const messenger = useSessionMessenger();

  useEffect(() => {
    (async () => {
      const res = await messenger.send('session_getRequesterAppInfo');
      setRequesterUrl(res.url);
    })();
  }, [messenger]);

  if (!requesterUrl) return <h1>waiting...</h1>;

  return (
    <Flex direction="column" h="100%" paddingY="16px" paddingX="32px">
      <Heading>Connect Request </Heading>
      <Text>Allow {requesterUrl} to: see used locks, unused locks, activity and suggest transactions to approve</Text>

      <Spacer />
      <Button
        onClick={async () => {
          await messenger.send('session_approveEnableWallet');
          window.close();
        }}
      >
        Approve
      </Button>
    </Flex>
  );
};
