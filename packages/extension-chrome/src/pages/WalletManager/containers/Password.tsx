import React, { FC } from 'react';
import { Flex, FormControl, FormLabel, Input, Link, Checkbox, Heading, VStack } from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';

import { useWalletCreationStore } from '../store';

type FormValues = {
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
};

type FormFieldProps = { field: {} };

const PasswordInputs: FC = () => {
  return (
    <>
      <FormControl>
        <FormLabel fontSize="sm">New password (8 characters minimum)</FormLabel>
        <Field name="password">{({ field }: FormFieldProps) => <Input size="lg" type="password" {...field} />}</Field>
      </FormControl>
      <FormControl>
        <FormLabel fontSize="sm">Confirm password</FormLabel>
        <Field name="confirmPassword">
          {({ field }: FormFieldProps) => <Input size="lg" type="password" {...field} />}
        </Field>
      </FormControl>
    </>
  );
};

export const SetPassword: FC = () => {
  const store = useWalletCreationStore();

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
      <Flex direction="column" w="100%" maxW="400px">
        <Heading mb="48px" lineHeight="111%" fontWeight="semibold">
          Create password
        </Heading>
        {/* TODO: formik may not the best form state controller */}
        <Formik
          initialValues={{
            password: '',
            confirmPassword: '',
            agreeTerms: false,
          }}
          validate={onValidateForm}
          validateOnChange
          onSubmit={() => {}}
        >
          {(props) => (
            <VStack as={Form}>
              <PasswordInputs />
              <FormControl>
                <Checkbox name="agreeTerms" isChecked={props.values.agreeTerms} onChange={props.handleChange}>
                  I have read and agree to the{' '}
                  <Link color="purple.500" fontWeight="bold">
                    Terms of use
                  </Link>
                </Checkbox>
              </FormControl>
            </VStack>
          )}
        </Formik>
      </Flex>
    </>
  );
};
