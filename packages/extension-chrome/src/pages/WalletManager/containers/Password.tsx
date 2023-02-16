import React, { FC, useEffect } from 'react';
import { FormControl, FormLabel, Input, Heading, VStack, Box, FormErrorMessage } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';

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

  const { control, handleSubmit, formState } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    whenSubmit &&
      whenSubmit(
        handleSubmit(({ password }) => {
          setStore({ password });
        }),
      );
  }, [whenSubmit, setStore, handleSubmit]);

  useEffect(() => {
    setNextAvailable(formState.isValid);
  }, [setNextAvailable, formState]);

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
        <Controller
          control={control}
          name="password"
          rules={{
            required: true,
            minLength: 8,
          }}
          render={({ field, fieldState }) => (
            <FormControl
              isInvalid={fieldState.invalid && field.value.length > 0 && fieldState.error?.type !== 'required'}
            >
              <FormLabel fontSize="sm">New password (8 characters minimum)</FormLabel>
              <Input
                w="264px"
                size="lg"
                placeholder="Input your password"
                type="password"
                data-test-id="password"
                {...field}
              />
              <FormErrorMessage>Your password must be at least 8 characters long.</FormErrorMessage>
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: true,
            validate: (password, formValue) => {
              return password === formValue.confirmPassword;
            },
          }}
          render={({ field, fieldState }) => (
            <FormControl
              isInvalid={fieldState.invalid && field.value.length > 0 && fieldState.error?.type !== 'required'}
            >
              <FormLabel fontSize="sm">Confirm password</FormLabel>
              <Input
                w="264px"
                size="lg"
                type="password"
                data-test-id="confirmPassword"
                placeholder="input your password"
                {...field}
              />
              <FormErrorMessage>Your two passwords are not correspond</FormErrorMessage>
            </FormControl>
          )}
        />

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
