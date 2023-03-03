import React, { FC } from 'react';
import { Flex, Spacer, Button, Radio, RadioGroup, Skeleton, Icon } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import EditIcon from '../../../Components/icons/edit.svg';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { WhiteAlphaBox } from '../../../Components/WhiteAlphaBox';
import { useConfigQuery } from '../../../hooks/useConfigQuery';
import { useService } from '../../../hooks/useService';

const PERSIST_IDS = new Set(['mainnet', 'testnet']);

export const NetworkConfig: FC = () => {
  const configQuery = useConfigQuery();
  const configService = useService('configService');
  const toggleNetworkMutation = useMutation({
    mutationFn: (id: string) => {
      return configService.setSelectedNetwork({ id }) as Promise<void>;
    },
  });

  const currentNetwork = configQuery.data?.selectedNetwork;

  const onToggle = (id: string) => {
    toggleNetworkMutation.mutate(id);
  };
  const navigate = useNavigate();

  const networks = configQuery.data?.networks;
  const gotoEdit = (id: string) => () => {
    navigate(`/network/edit/${id}`);
  };

  const removeNetworkMutation = useMutation({
    mutationFn: async (id: string) => {
      const current = await configService.getSelectedNetwork();
      await configService.removeNetwork({ id });
      if (current.id === id) {
        await configService.setSelectedNetwork({ id: 'mainnet' });
      }

      await configQuery.refetch();
    },
  });

  return (
    <Skeleton h="100%" as={Flex} flexDirection="column" alignItems="center" isLoaded={!!networks}>
      <WhiteAlphaBox p="10px 20px">
        <RadioGroup
          data-test-id="networkRadio"
          onChange={onToggle}
          defaultValue={currentNetwork}
          display="flex"
          w="100%"
          flexDirection="column"
        >
          <Flex flexDir="column">
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
                padding="10px"
                key={network.id}
                w="100%"
                alignItems="center"
                justifyContent="space-between"
              >
                <Radio colorScheme="cyan" data-test-id={`networkRadio[${index}]`} value={network.id}>
                  {network.displayName}
                </Radio>
                <Spacer />
                {!PERSIST_IDS.has(network.id) && (
                  <Flex className="operations">
                    <Icon as={EditIcon} onClick={gotoEdit(network.id)} w="24px" h="24px" mr="20px" />
                    <DeleteIcon
                      onClick={() => {
                        removeNetworkMutation.mutate(network.id);
                      }}
                      w="24px"
                      h="24px"
                      color="white"
                    />
                  </Flex>
                )}
              </Flex>
            ))}
          </Flex>
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
