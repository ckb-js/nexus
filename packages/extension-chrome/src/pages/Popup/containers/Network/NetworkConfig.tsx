import React, { FC } from 'react';
import { Flex, Spacer, Button, Radio, RadioGroup, Skeleton, Icon, useToast, VStack, Box } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import EditIcon from '../../../Components/icons/Edit.svg';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { WhiteAlphaBox } from '../../../Components/WhiteAlphaBox';
import { useConfigQuery } from '../../../hooks/useConfigQuery';
import { useService } from '../../../hooks/useService';

// TODO: add this to config service provider
const PERSIST_IDS = new Set(['mainnet', 'testnet']);

export const NetworkConfig: FC = () => {
  const configQuery = useConfigQuery();
  const configService = useService('configService');
  const toast = useToast();
  const toggleNetworkMutation = useMutation({
    mutationFn: (id: string) => {
      return configService.setSelectedNetwork({ id }) as Promise<void>;
    },
  });

  const currentNetwork = configQuery.data?.selectedNetwork;

  const onToggle = async (id: string) => {
    await toggleNetworkMutation.mutateAsync(id);
    await configQuery.invalidate();
  };
  const navigate = useNavigate();

  const networks = configQuery.data?.networks;
  const gotoEdit = (id: string) => () => {
    if (currentNetwork === id) {
      toast({
        title: 'You can not edit the current network',
        status: 'warning',
        position: 'top',
      });
      return;
    }
    navigate(`/network/edit/${id}`);
  };

  const removeNetworkMutation = useMutation({
    mutationFn: async (id: string) => {
      const current = await configService.getSelectedNetwork();
      // if we want remove current network, we need to switch to mainnet
      if (current.id === id) {
        await configService.setSelectedNetwork({ id: 'mainnet' });
      }
      await configService.removeNetwork({ id });

      await configQuery.invalidate();
    },
  });

  return (
    <Skeleton h="100%" as={Flex} flexDirection="column" alignItems="center" isLoaded={!!networks}>
      <WhiteAlphaBox overflowY="auto" maxH="500px" p="20px">
        <RadioGroup
          value={currentNetwork}
          data-test-id="networkRadio"
          onChange={onToggle}
          display="flex"
          w="100%"
          flexDirection="column"
        >
          <VStack spacing="20px" flexDir="column">
            {networks?.map((network, index) => (
              <Flex
                sx={{
                  '&:hover .operations': {
                    opacity: 1,
                  },
                  '& .operations': {
                    opacity: 0,
                    '& svg': {
                      cursor: 'pointer',
                    },
                  },
                }}
                key={network.id}
                w="100%"
                alignItems="center"
                justifyContent="space-between"
              >
                <Radio colorScheme="cyan" data-test-id={`networkRadio[${index}]`} value={network.id}>
                  <Box marginLeft="12px">{network.displayName}</Box>
                </Radio>
                <Spacer />
                {!PERSIST_IDS.has(network.id) && (
                  <Flex className="operations">
                    <Icon as={EditIcon} onClick={gotoEdit(network.id)} w="24px" h="24px" mr="20px" />
                    <DeleteIcon
                      onClick={async () => {
                        await removeNetworkMutation.mutateAsync(network.id);
                        await configQuery.invalidate();
                      }}
                      w="24px"
                      h="24px"
                      color="white"
                    />
                  </Flex>
                )}
              </Flex>
            ))}
          </VStack>
        </RadioGroup>
      </WhiteAlphaBox>
      <Spacer />
      <Button
        data-test-id="addNetwork"
        onClick={() => {
          navigate('/network/add');
        }}
        w="100%"
        size="lg"
        leftIcon={<AddIcon h="16px" w="16px" />}
      >
        Add Network
      </Button>
    </Skeleton>
  );
};
