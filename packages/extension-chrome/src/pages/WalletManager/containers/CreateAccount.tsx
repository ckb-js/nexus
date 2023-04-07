import { FormControl, FormLabel, Heading, Input, Box, FormErrorMessage } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import Avatar from '../../Components/icons/Avatar.svg';
import React, { FC, useEffect } from 'react';
import { useWalletCreationStore } from '../store';
import { useOutletContext } from './CreateProcessFrame';

export const CreateAccount: FC<{ isImportSeed?: boolean }> = ({ isImportSeed }) => {
  const { set: setStoreState, initWallet } = useWalletCreationStore();

  const { whenSubmit, setNextAvailable } = useOutletContext();

  const { formState, handleSubmit, control } = useForm<{ username: string }>({
    mode: 'onChange',
    values: { username: '' },
  });

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
        <Controller
          control={control}
          name="username"
          rules={{
            required: true,
            maxLength: { value: 12, message: 'Username must be ≤ 12 characters' },
          }}
          render={({ fieldState, field }) => (
            <FormControl isInvalid={fieldState.invalid && fieldState.error?.type !== 'required'}>
              <FormLabel>A Descriptive Name For Your Wallet</FormLabel>
              <Input data-test-id="username" placeholder="Username" {...field} />
              <FormErrorMessage>{fieldState.error?.message}</FormErrorMessage>
            </FormControl>
          )}
        />
      </Box>
    </>
  );
};
