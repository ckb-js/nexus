/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  FormControl,
  Input,
  FormLabel,
  Flex,
  Grid,
  Text,
  Heading,
  Box,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import times from 'lodash.times';
import React from 'react';
import { FC } from 'react';

// TODO: use real service

const SeedInput: FC<{ index: number }> = ({ index }) => {
  return (
    <FormControl as={Flex} alignItems="center">
      <FormLabel mr="8px" w="16px">
        {`${index + 1}`.padStart(2, ' ')}
      </FormLabel>
      <Input mr="8px" type="password" w="186px" />
    </FormControl>
  );
};

/**
 * Confirm the mnemonic
 */
export const RecoveryWallet: FC = () => {
  const inputs = times(12, (index) => <SeedInput index={index} key={index} />);

  return (
    <>
      <Heading fontWeight="semibold" lineHeight="111%" mb="48px">
        Access Wallet With Your Seed
      </Heading>
      <Text lineHeight="6" fontSize="md" mb="16px" w="672px">
        Nexus cannot recover your password. We will use your Seed to validate your ownership, restore your wallet and
        set up a new password. First, enter the Seed that you were given when you created your wallet.
      </Text>

      <Text fontSize="md" mb="16px" fontWeight="extrabold" w="672px" as={Box}>
        Type your Seed here
      </Text>
      <Alert mb="16px" status="info">
        <AlertIcon />
        <AlertDescription fontSize="md">You can paste your entire Seed into any field</AlertDescription>
      </Alert>
      <Box display="grid">
        <Grid w="672px" templateColumns="repeat(3, 1fr)" column={3} gap="12px">
          {inputs}
        </Grid>
      </Box>
    </>
  );
};
