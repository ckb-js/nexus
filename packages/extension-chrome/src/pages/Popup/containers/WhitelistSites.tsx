import React, { FC } from 'react';
import { Flex, IconButton } from '@chakra-ui/react';
import { DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

import { ResponsiveContainer } from '../../Components/ResponsiveContainer';

// TODO: use real service
import configService from '../../../mockServices/config';
import { useMutation, useQuery } from '@tanstack/react-query';

export const WhitelistSites: FC = () => {
  const whitelistSiteQuery = useQuery({
    queryKey: ['whitelist'],
    queryFn: () => configService.getWhitelist(),
  });

  const removeWhitelistSiteMutation = useMutation({
    mutationFn: (url: string) => configService.removeWhitelistItem({ url: url }),
  });

  const navigate = useNavigate();
  const removeSite = (site: string) => async () => {
    await removeWhitelistSiteMutation.mutateAsync(site);
    await whitelistSiteQuery.refetch();
  };

  return (
    <ResponsiveContainer h="100%" centerContent>
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
        {whitelistSiteQuery.data?.map((site) => (
          <Flex key={site} w="100%" mb="16px">
            <Flex ml="16px" flex={1} fontSize="lg" alignItems="center">
              {site}
            </Flex>
            <IconButton
              flex={0}
              borderRadius="16px"
              aria-label="delete"
              icon={<DeleteIcon />}
              onClick={removeSite(site)}
            >
              Remove
            </IconButton>
          </Flex>
        ))}
      </Flex>
    </ResponsiveContainer>
  );
};
