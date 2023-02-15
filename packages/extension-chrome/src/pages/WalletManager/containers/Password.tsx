import React, { FC, useEffect } from 'react';
import { FormControl, FormLabel, Input, Heading, VStack, Box, FormErrorMessage } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

import { useWalletCreationStore } from '../store';
import { useOutletContext } from 'react-router-dom';
import { OutletContext } from './CreateProcessFrame';

type FormValues = {
  password: string;
  confirmPassword: string;
  // agreeTerms: boolean;
};

export type SetPasswordProps = {
  isImportSeed?: boolean;
};

export const SetPassword: FC<SetPasswordProps> = ({ isImportSeed }) => {
  const setStore = useWalletCreationStore((s) => s.set);
  const { whenSubmit, setNextAvailable } = useOutletContext() as OutletContext;

  const { register, handleSubmit, getValues, watch, formState } = useForm<FormValues>({
    mode: 'onChange',
  });

  useEffect(() => {
    whenSubmit &&
      whenSubmit(() =>
        handleSubmit(({ password }) => {
          setStore({ password });
        }),
      );
  }, [whenSubmit, setStore, handleSubmit]);

  useEffect(() => {
    setNextAvailable(formState.isValid);
  }, [setNextAvailable, formState]);

  const showPasswordError = !!watch('password') && !!formState.errors.password;
  const confirmPasswordError = !showPasswordError && !!watch('confirmPassword') && !!formState.errors.confirmPassword;

  return (
    <>
      <Heading mb="48px" lineHeight="111%" fontWeight="semibold">
        Create password
      </Heading>
      {isImportSeed && (
        <Box maxW="502px" mb="16px" fontSize="md">
          This password will unlock your Nexus wallet only on this device. Nexus can not recover this password.
        </Box>
      )}
      <VStack>
        <FormControl isInvalid={showPasswordError}>
          <FormLabel fontSize="sm">New password (8 characters minimum)</FormLabel>
          <Input
            size="lg"
            placeholder="Input your password"
            type="password"
            {...register('password', { minLength: 8 })}
          />
          <FormErrorMessage>Your password must be at least 8 characters long.</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={confirmPasswordError}>
          <FormLabel fontSize="sm">Confirm password</FormLabel>
          <Input
            size="lg"
            type="password"
            placeholder="input your password"
            {...register('confirmPassword', {
              minLength: 8,
              validate: (value) => {
                return value && getValues('password') === value;
              },
            })}
          />
          <FormErrorMessage>Your two passwords are not correspond</FormErrorMessage>
        </FormControl>

        {/* Not implement */}
        {/* <FormControl>
            <Checkbox onChange={register('agreeTerms', {}).onChange}>
              I have read and agree to the{' '}
              <Link color="purple.500" fontWeight="bold">
                Terms of use
              </Link>
            </Checkbox>
          </FormControl> */}
      </VStack>
    </>
  );
};
