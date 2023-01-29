import React, { FC } from 'react';
import { Flex, Spacer, Button, Avatar, IconButton, Radio, RadioGroup } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import networkService, { NetworkConfig as Network } from '../../../../services/network';

import { ResponsiveContainer } from '../../../Components/ResponsiveContainer';
import { useMutation, useQuery } from '@tanstack/react-query';

export const NetworkConfig: FC = () => {
  const networkQuery = useQuery({
    queryKey: ['networks'],
    queryFn: () => networkService.getNetwork(),
  });

  const currentNetwork = networkQuery.data?.find((network) => network.enable)?.url;
  const toggleNetworkMutation = useMutation({
    mutationFn: (network: Network) => networkService.toggleNetwork(network),
  });

  const onToggle = (nextValue: string) => {
    const network = networkQuery.data?.find((network) => network.url === nextValue);
    if (network) {
      toggleNetworkMutation.mutate(network);
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
          {networkQuery.data?.map((network) => (
            <Flex key={network.url + network.url} w="100%" mb="16px" alignItems="center">
              <Avatar flexGrow={0} name={network.name} />
              <Radio ml="32px" value={network.url}>
                {network.name}
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
