import React, { FC } from 'react';
import { Flex, Spacer, Button, Radio, RadioGroup, VStack } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

// TODO: use real service
import configService from '../../../../mockServices/config';

import { useMutation, useQuery } from '@tanstack/react-query';
import { WhiteAlphaBox } from '../../../Components/WhiteAlphaBox';

export const NetworkConfig: FC = () => {
  const networkQuery = useQuery({
    queryKey: ['networks'],
    queryFn: async () => {
      const [networks, selectedNetwork] = await Promise.all([
        configService.getNetworks(),
        configService.getSelectedNetwork(),
      ]);
      return {
        networks,
        selectedNetwork,
      };
    },
  });

  const currentNetwork = networkQuery.data?.selectedNetwork;
  const toggleNetworkMutation = useMutation({
    mutationFn: (id: string) => configService.setSelectedNetwork({ id }),
  });

  const onToggle = (nextValue: string) => {
    const networkId = networkQuery.data?.networks.find((network) => network.id === nextValue)?.id;
    if (networkId) {
      toggleNetworkMutation.mutate(networkId);
    }
  };
  const navigate = useNavigate();

  return (
    <>
      <WhiteAlphaBox p="16px 20px">
        <RadioGroup
          data-test-id="networkRadio"
          onChange={onToggle}
          defaultValue={currentNetwork}
          display="flex"
          flexDirection="column"
        >
          <VStack spacing="20px">
            {networkQuery.data?.networks.map((network, index) => (
              <Flex key={network.id} w="100%" alignItems="center">
                <Radio colorScheme="cyan" data-test-id={`networkRadio[${index}]`} ml="32px" value={network.id}>
                  {network.displayName}
                </Radio>
                <Spacer />
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
    </>
  );
};
