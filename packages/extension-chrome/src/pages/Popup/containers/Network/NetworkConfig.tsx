import React, { FC } from 'react';
import { Flex, Spacer, Button, Avatar, IconButton, Radio, RadioGroup } from '@chakra-ui/react';
import { useLoaderData } from 'react-router-dom';
import { DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useList } from 'react-use';
import { NetworkConfigWithStatus } from '../../../../services/network';

import { ResponsiveContainer } from '../../../Components/ResponsiveContainer';
import siteService, { Site } from '../../../../services/site';

export const NetworkConfig: FC = () => {
  const initialData = useLoaderData() as NetworkConfigWithStatus[];
  const currentNetwork = initialData.find((network) => network.enable)?.url;
  const [networks, sitesActions] = useList(initialData);
  const navigate = useNavigate();
  const removeSite = (site: Site, index: number) => async () => {
    await siteService.removeSites(site);
    sitesActions.removeAt(index);
  };

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
        <RadioGroup defaultValue={currentNetwork} w="100%" display="flex" flexDirection="column">
          {networks.map((network, index) => (
            <Flex key={network.url + network.url} w="100%" mb="16px" alignItems="center">
              <Avatar flexGrow={0} name={network.name} />
              <Radio ml="32px" value={network.url}>
                {network.name}
              </Radio>
              <Spacer />
              <IconButton
                flex={0}
                borderRadius="16px"
                aria-label="delete"
                icon={<DeleteIcon />}
                onClick={removeSite(network, index)}
              >
                Remove
              </IconButton>
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
