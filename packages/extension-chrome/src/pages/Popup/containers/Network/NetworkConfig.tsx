import React, { FC } from 'react';
import { Flex, Spacer, Button, Avatar, IconButton, Radio, RadioGroup } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

// TODO: use real service
import configService from '../../../../mockServices/config';

import { ResponsiveContainer } from '../../../Components/ResponsiveContainer';
import { useMutation, useQuery } from '@tanstack/react-query';

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
    <ResponsiveContainer h="100%" display="flex" centerContent>
      <Flex justifyContent="flex-start" w="100%">
        <IconButton
          onClick={() => {
            navigate('/');
          }}
          icon={<ArrowBackIcon />}
          aria-label="back"
        />
      </Flex>
      <Flex h="100%" w="100%" direction="column" mt="16px" alignItems="center" justifyContent="flex-start">
        <RadioGroup onChange={onToggle} defaultValue={currentNetwork} w="100%" display="flex" flexDirection="column">
          {networkQuery.data?.networks.map((network) => (
            <Flex key={network.id} w="100%" mb="16px" alignItems="center">
              <Avatar flexGrow={0} name={network.displayName} />
              <Radio ml="32px" value={network.id}>
                {network.displayName}
              </Radio>
              <Spacer />
            </Flex>
          ))}
        </RadioGroup>
      </Flex>
      <Spacer />
      <Button
        onClick={() => {
          navigate('/network/add');
        }}
        marginBottom="32px"
        size="lg"
      >
        Add Network
      </Button>
    </ResponsiveContainer>
  );
};
