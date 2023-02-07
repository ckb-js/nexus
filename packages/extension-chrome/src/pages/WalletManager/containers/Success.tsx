import { Container, Heading, Spacer, Text } from '@chakra-ui/react';
import React, { FC } from 'react';

export const Success: FC = () => {
  return (
    <Container h="100%" maxW="6xl" centerContent>
      <Spacer />
      <Heading>🎉Congratulations!🎉</Heading>
      <Text mt="40px" fontSize="2xl">
        Your wallet is ready. Welcome to the world of CKB
      </Text>
      <Text mt="40px" fontSize="lg">
        Now you can close this page and go back to the extension
      </Text>
      <Spacer />
    </Container>
  );
};
