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
      <Heading mb="48px" lineHeight="111%" fontWeight="semibold">
        Select Username
      </Heading>
      <Box as={Avatar} mb="12px" w="96px" h="96px" />

      <FormControl>
        <FormLabel>A Descriptive Name For Your Wallet</FormLabel>
        <Input value={userName} onChange={onNameChange} placeholder="User name" />
      </FormControl>
    </>
  );
};
