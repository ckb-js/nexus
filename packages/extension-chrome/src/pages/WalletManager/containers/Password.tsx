import React, { FC } from 'react';
import { FormControl, FormLabel, Input, Heading, VStack, Box } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

import { useWalletCreationStore } from '../store';

type FormValues = {
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
};

export type SetPasswordProps = {
  isImportSeed?: boolean;
};

export const SetPassword: FC<SetPasswordProps> = ({ isImportSeed }) => {
  const store = useWalletCreationStore();

  const { register, handleSubmit } = useForm<FormValues>({
    mode: 'onChange',
  });

  const onValidateForm = ({ password, confirmPassword, agreeTerms }: FormValues) => {
    if (password.length < 8) {
      return {
        password: 'Password must be at least 8 characters',
      };
    }

    if (password !== confirmPassword) {
      return {
        confirmPassword: 'Passwords do not match',
      };
    }

    if (!agreeTerms) {
      return {
        agreeTerms: 'You must agree to the terms',
      };
    }

    store.set({ password, dischargeNext: true });
  };

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
      {/* TODO: formik may not the best form state controller */}
      <VStack as="form" onSubmit={handleSubmit(onValidateForm)}>
        <FormControl>
          <FormLabel fontSize="sm">New password (8 characters minimum)</FormLabel>
          <Input
            size="lg"
            placeholder="Input your password"
            type="password"
            {...register('password', { required: true })}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Confirm password</FormLabel>
          <Input
            size="lg"
            type="password"
            placeholder="input your password"
            {...register('confirmPassword', { required: true })}
          />
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
