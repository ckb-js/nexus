import { FormControl, FormLabel, Heading, Input, Box } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import Avatar from '../../Components/icons/Avatar.svg';
import React, { FC, useEffect } from 'react';
import { useWalletCreationStore } from '../store';
import { useOutletContext } from './CreateProcessFrame';

export const CreateAccount: FC<{ isImportSeed?: boolean }> = ({ isImportSeed }) => {
  const { set: setStoreState, initWallet } = useWalletCreationStore();

  const { whenSubmit, setNextAvailable } = useOutletContext();

  const { register, formState, handleSubmit } = useForm<{ username: string }>();

  useEffect(() => {
    whenSubmit?.(
      handleSubmit(({ username }) => {
        setStoreState({ username: username });
        return isImportSeed && initWallet();
      }),
    );
  }, [whenSubmit, handleSubmit, setStoreState, isImportSeed, initWallet]);

  useEffect(() => {
    setNextAvailable(formState.isValid);
  }, [formState.isValid, setNextAvailable]);

  return (
    <>
      <Heading mb="48px" lineHeight="111%" fontWeight="semibold">
        Create Username
      </Heading>
      <Box as={Avatar} mb="12px" w="96px" h="96px" />

      <Box>
        <FormControl>
          <FormLabel>A Descriptive Name For Your Wallet</FormLabel>
          <Input data-test-id="username" {...register('username', { required: true })} placeholder="User name" />
        </FormControl>
      </Box>
    </>
  );
};
