/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  FormControl,
  Input,
  FormLabel,
  Flex,
  Grid,
  Text,
  Button,
  Heading,
  SimpleGrid,
  Box,
  InputProps,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import times from 'lodash.times';
import React, { useState } from 'react';
import { FC } from 'react';
import { useList, useToggle } from 'react-use';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

// TODO: use real service
import walletService from '../../../mockServices/wallet';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const SeedInput: FC<{ index: number }> = ({ index }) => {
  const [seedVisible, toggleSeedVisible] = useToggle(false);

  const Eye = seedVisible ? ViewIcon : ViewOffIcon;

  return (
    <FormControl as={Flex} alignItems="center">
      <FormLabel>{index}</FormLabel>
      <Input mr="8px" type={seedVisible ? 'text' : 'password'} w="152px" />
      <Eye fontSize="lg" onClick={toggleSeedVisible} cursor="pointer" />
    </FormControl>
  );
};

/**
 * Confirm the mnemonic
 */
export const RecoveryWallet: FC = () => {
  const [mnemonicWords, mnemonicWordAction] = useList(times(12, () => ''));
  const [password, setPassword] = useState('');
  const saveWallet = useMutation({
    mutationFn: ({ mnemonicWords, password }: { mnemonicWords: string[]; password: string }) =>
      walletService.createNewWallet(mnemonicWords, password),
  });
  const navigate = useNavigate();

  const inputs = times(12, (index) => <SeedInput index={index} key={index} />);

  const onRecoveryWallet = async () => {
    saveWallet.mutateAsync({ mnemonicWords, password });
    navigate('/success', { replace: true });
  };

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
