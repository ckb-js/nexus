import React, { FC } from 'react';
import { Button, FormControl, FormLabel, Input, Flex, Spacer } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSetState } from 'react-use';
// TODO: use real service
import configService, { NetworkConfig } from '../../../../mockServices/config';
import { WhiteAlphaBox } from '../../../Components/WhiteAlphaBox';

export const AddNetwork: FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useSetState({ name: '', url: '' });
  const onAddNetwork = () => {
    configService.addNetwork({ displayName: state.name, networkName: state.name, id: '114514' } as NetworkConfig);
    navigate('/network');
  };

  const onChange = (field: keyof typeof state) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ [field]: e.target.value });
  };

  return (
    <>
      <WhiteAlphaBox mt="32px" w="448px" p="35px 20px" direction="column">
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input color="black" backgroundColor="white" onChange={onChange('name')} name="name" />
        </FormControl>

        <FormControl>
          <FormLabel>URL</FormLabel>
          <Input color="black" backgroundColor="white" name="url" onChange={onChange('url')} />
        </FormControl>
      </WhiteAlphaBox>
      <Spacer />
      <Flex as="form" direction="column" justifyContent="center">
        <Button size="lg" width="448px" marginY="12px" onClick={onAddNetwork}>
          Add
        </Button>
      </Flex>
    </>
  );
};
