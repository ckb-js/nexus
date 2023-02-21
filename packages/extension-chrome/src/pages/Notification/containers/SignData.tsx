import { Box, Button, ButtonGroup, Flex, Heading, Link, Text, VStack } from '@chakra-ui/react';
import React, { FC } from 'react';
import { WhiteAlphaBox } from '../../Components/WhiteAlphaBox';

// TODO: implement
export const SignData: FC = () => {
  return (
    <>
      <Heading fontSize="2xl" fontWeight="semibold" w="452px" mt="28px">
        Sign Message
      </Heading>

      <WhiteAlphaBox mt="32px" p="16px 20px">
        <Link fontSize="sm">https://link3.to</Link>
      </WhiteAlphaBox>

      <Box mt="32px" fontWeight="semibold" fontSize="md">
        Only sign this message if you fully understand the content and trust the requesting site.
      </Box>

      <VStack as={WhiteAlphaBox} mt="32px" spacing="12px" alignItems="flex-start" direction="column" p="16px 20px">
        <Heading size="sm" as={Flex} w="100%" justifyContent="center">
          You are signing
        </Heading>
        <Heading as={Flex} fontWeight="bold" size="sm">
          Message:
        </Heading>
        <Text fontSize="md" w="100%">
          link3.to wants you to sign in with your Nexus account:
          {' 0x2ea31djfakljfkadjkfjda;kfjdf29e43098903458045j'}
        </Text>
      </VStack>

      <ButtonGroup mt="32px" size="md">
        <Button onClick={() => window.close()} w="220px" color="gray.800" colorScheme="gray">
          Reject
        </Button>

        <Button
          w="220px"
          onClick={async () => {
            // await browser.runtime.sendMessage({ method: 'userHasEnabledWallet' });
            window.close();
          }}
        >
          Approve
        </Button>
      </ButtonGroup>
    </>
  );
};
