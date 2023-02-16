import React, { FC } from 'react';
import { Button, FormControl, FormLabel, Input, Flex, Spacer, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

// TODO: use real service
import configService, { NetworkConfig } from '../../../../mockServices/config';
import { WhiteAlphaBox } from '../../../Components/WhiteAlphaBox';
import { AddIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';

type AddNetworkFormState = {
  name: string;
  url: string;
};

export const AddNetwork: FC = () => {
  const navigate = useNavigate();

  const { handleSubmit, register } = useForm<AddNetworkFormState>();
  const onSubmit = handleSubmit(({ name, url }) => {
    // TODO: align the type
    configService.addNetwork({ name, url } as unknown as NetworkConfig);
    navigate(-1);
  });

  return (
    <Flex direction="column" h="100%" as="form" onSubmit={onSubmit}>
      <VStack as={WhiteAlphaBox} spacing="16px" p="35px 20px" direction="column">
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input
            color="black"
            variant="outline"
            backgroundColor="white"
            {...register('name', { required: true })}
            name="name"
          />
        </FormControl>

        <FormControl>
          <FormLabel>URL</FormLabel>
          <Input
            color="black"
            variant="outline"
            backgroundColor="white"
            {...register('url', {
              // pattern: /https:\/\/[a-zA-Z_-.~]+/
            })}
          />
        </FormControl>
      </VStack>
      <Spacer />
      <Flex as="form" direction="column" justifyContent="center">
        <Button
          data-test-id="add"
          size="lg"
          width="452px"
          leftIcon={<AddIcon h="16px" w="16px" />}
          marginY="12px"
          type="submit"
        >
          Add
        </Button>
      </Flex>
    </Flex>
  );
};
