import React, { FC } from 'react';
import { Flex, Spacer, Button, Radio, RadioGroup, VStack, Skeleton } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { WhiteAlphaBox } from '../../../Components/WhiteAlphaBox';
import { useConfigQuery } from '../../../hooks/useConfigQuery';
import { useService } from '../../../hooks/useService';

export const NetworkConfig: FC = () => {
  const configQuery = useConfigQuery();
  const configService = useService('configService');
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

  return (
    <Skeleton h="100%" as={Flex} flexDirection="column" alignItems="center" isLoaded={!!networks}>
      <WhiteAlphaBox overflowY="auto" maxH="500px" p="16px 20px">
        <RadioGroup
          data-test-id="networkRadio"
          value={currentNetwork}
          onChange={onToggle}
          display="flex"
          flexDirection="column"
        >
          <VStack spacing="20px">
            {networks?.map((network, index) => (
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
    </Skeleton>
  );
};
