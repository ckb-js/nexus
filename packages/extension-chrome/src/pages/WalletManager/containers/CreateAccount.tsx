import { FormControl, FormLabel, Heading, Input, Box } from '@chakra-ui/react';
import Avatar from '../../Components/icons/Avatar.svg';
import React, { FC } from 'react';
import { useWalletCreationStore } from '../store';

export const CreateAccount: FC = () => {
  const { set: setStoreState, userName } = useWalletCreationStore();

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreState({ userName: e.target.value, dischargeNext: Boolean(e.target.value) });
  };

  return (
    <>
      <Heading mb="48px">Create Account</Heading>
      <Box as={Avatar} mb="12px" />

      <FormControl w="220px">
        <FormLabel>User name</FormLabel>
        <Input value={userName} onChange={onNameChange} placeholder="User name" />
      </FormControl>
    </>
  );
};
