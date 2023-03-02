import React, { FC } from 'react';
import { Button, FormControl, FormLabel, Input, Flex, Spacer, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { AddIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { nanoid } from 'nanoid';
import { useMutation } from '@tanstack/react-query';

import { WhiteAlphaBox } from '../../../Components/WhiteAlphaBox';
import { useService } from '../../../hooks/useService';

const HTTP_URL_PATTERN = /https?:\/\/[a-zA-Z_\-.~]+/;

type EditNetworkFormState = {
  name: string;
  rpcUrl: string;
};

type EditNetworkProps = {
  mode: 'add' | 'edit';
};

export const EditNetwork: FC<EditNetworkProps> = () => {
  const navigate = useNavigate();
  const configService = useService('configService');

  const { handleSubmit, register, formState } = useForm<EditNetworkFormState>();

  const onSubmit = handleSubmit(async ({ name, rpcUrl }, e) => {
    e?.preventDefault();
    await modifyNetworkMutation.mutateAsync({ name, rpcUrl });
    navigate('/network');
  });

  const modifyNetworkMutation = useMutation({
    mutationFn: ({ name, rpcUrl }: EditNetworkFormState) => {
      return configService.addNetwork({
        network: { displayName: name, rpcUrl, id: nanoid(), networkName: name },
      }) as Promise<void>;
    },
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
            {...register('rpcUrl', {
              required: true,
              pattern: HTTP_URL_PATTERN,
            })}
          />
        </FormControl>
      </VStack>
      <Spacer />
      <Flex direction="column" justifyContent="center">
        <Button
          data-test-id="add"
          size="lg"
          width="452px"
          isDisabled={!formState.isValid}
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
