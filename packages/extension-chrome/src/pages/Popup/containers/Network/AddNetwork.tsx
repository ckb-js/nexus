import React, { FC } from 'react';
import { Button, FormControl, FormLabel, Input, Flex } from '@chakra-ui/react';
import { ResponsiveContainer } from '../../../Components/ResponsiveContainer';
import { useNavigate } from 'react-router-dom';
import { useSetState } from 'react-use';
// TODO: use real service
import configService, { NetworkConfig } from '../../../../mockServices/config';

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
    <ResponsiveContainer>
      <Flex h="100%" as="form" direction="column" justifyContent="center">
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input onChange={onChange('name')} name="name" />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>URL</FormLabel>
          <Input name="url" onChange={onChange('url')} />
        </FormControl>
        <Button disabled={!state.name || !state.url} marginY="12px" onClick={onAddNetwork}>
          Add
        </Button>
        <Button
          onClick={() => {
            navigate('/network');
          }}
        >
          Cancel
        </Button>
      </Flex>
    </ResponsiveContainer>
  );
};
