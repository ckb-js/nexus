import React, { FC, useEffect } from 'react';
import { Button, FormControl, FormLabel, Input, Flex, Spacer, VStack, ButtonGroup, useToast } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { AddIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { nanoid } from 'nanoid';
import { useMutation } from '@tanstack/react-query';
import produce from 'immer';

import { WhiteAlphaBox } from '../../../Components/WhiteAlphaBox';
import { useService } from '../../../hooks/useService';

const HTTP_URL_PATTERN = /^https?:\/\/[a-zA-Z0-9-._/]+(:\d+)?$/;

type EditNetworkFormState = {
  name: string;
  rpcUrl: string;
};

type EditNetworkProps = {
  mode: 'add' | 'modify';
};

export const EditNetwork: FC<EditNetworkProps> = ({ mode }) => {
  const navigate = useNavigate();
  const configService = useService('configService');
  const toast = useToast();
  const { id } = useParams() as { id: string };

  const { handleSubmit, register, formState, setValue, trigger } = useForm<EditNetworkFormState>();

  const onSubmit = handleSubmit(async ({ name, rpcUrl }, e) => {
    e?.preventDefault();
    if (mode === 'modify') {
      await modifyNetworkMutation.mutateAsync({ name, rpcUrl, id });
    }
    if (mode === 'add') {
      await addNetworkMutation.mutateAsync({ name, rpcUrl });
    }
    navigate(-1);
  });

  const modifyNetworkMutation = useMutation({
    mutationFn: async ({ name, rpcUrl, id }: EditNetworkFormState & { id: string }) => {
      const networks = await configService.getNetworks();
      const newNetworks = produce(networks, (draft) => {
        for (const network of draft) {
          if (network.id === id) {
            network.displayName = name;
            network.rpcUrl = rpcUrl;
            network.networkName = name;
            return;
          }
        }
      });

      return configService.setConfig({
        config: {
          networks: newNetworks,
        },
      });
    },
  });

  useEffect(() => {
    if (mode === 'modify') {
      if (id) {
        (async () => {
          const networks = await configService.getNetworks();
          const network = networks.find((network) => network.id === id);
          if (network) {
            setValue('name', network.networkName);
            setValue('rpcUrl', network.rpcUrl);
            // manually trigger validation
            await trigger();
          }
        })().catch(() => {
          toast({
            status: 'error',
            title: 'Can not get origin network config',
          });
          navigate(-1);
        });
      }
    }
  }, [mode, id, configService, setValue, trigger, toast, navigate]);

  const addNetworkMutation = useMutation({
    mutationFn: async ({ name, rpcUrl }: EditNetworkFormState) => {
      return configService.addNetwork({
        network: { displayName: name, rpcUrl, id: nanoid(), networkName: name },
      });
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

      <ButtonGroup my="12px">
        {mode === 'add' && (
          <Button
            data-test-id="add"
            size="lg"
            width="452px"
            isDisabled={!formState.isValid}
            leftIcon={<AddIcon h="16px" w="16px" />}
            type="submit"
          >
            Add
          </Button>
        )}

        {mode === 'modify' && (
          <>
            <Button
              onClick={() => {
                navigate(-1);
              }}
              colorScheme="gray"
              color="gray.800"
              data-test-id="add"
              width="220px"
            >
              Cancel
            </Button>
            <Button data-test-id="add" width="220px" isDisabled={!formState.isValid} type="submit">
              Save
            </Button>
          </>
        )}
      </ButtonGroup>
    </Flex>
  );
};
