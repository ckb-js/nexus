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

  const { control, handleSubmit, formState, trigger } = useForm<FormValues>({
    mode: 'onBlur',
    values: {
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
    <Box>
      <Heading mb="48px" lineHeight="111%" fontWeight="semibold">
        Create password
      </Heading>
      {isImportSeed && (
        <Box w="502px" mb="16px" fontSize="md">
          This password will unlock your Nexus wallet only on this device. Nexus can not recover this password.
        </Box>
      )}
      <VStack>
        <Controller
          control={control}
          name="password"
          rules={{
            required: true,
            minLength: { value: 8, message: 'Password must be ≥ 8 characters' },
          }}
          render={({ field, fieldState }) => (
            <FormControl
              minH="98px"
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
              <FormErrorMessage>{fieldState.error?.message}</FormErrorMessage>
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: true,
            validate: (confirmPassword, formValue) => {
              return confirmPassword === formValue.password || 'Passwords do not match';
            },
          }}
          render={({ field, fieldState }) => (
            <FormControl
              minHeight="98px"
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
                onChange={(e) => {
                  // this field need to be validated when password field change
                  field.onChange(e);
                  return trigger('confirmPassword');
                }}
              />
              <FormErrorMessage>{fieldState.error?.message}</FormErrorMessage>
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
    </Box>
  );
};
