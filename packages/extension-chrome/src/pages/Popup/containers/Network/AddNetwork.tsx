import React, { FC } from 'react';
import { Button, FormControl, FormLabel, Input, Flex } from '@chakra-ui/react';
import { ResponsiveContainer } from '../../../Components/ResponsiveContainer';
import { useNavigate } from 'react-router-dom';
import networkService from '../../../../services/network';
import { useSetState } from 'react-use';

export const AddNetwork: FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useSetState({ name: '', url: '' });
  const onAddNetwork = () => {
    networkService.addNetwork({ name: state.name, url: state.url });
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

        <FormControl>
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
