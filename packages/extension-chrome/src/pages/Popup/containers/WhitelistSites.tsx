import React, { FC } from 'react';
import { Flex, Avatar, IconButton } from '@chakra-ui/react';
import { useLoaderData } from 'react-router-dom';
import { DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useList } from 'react-use';

import { ResponsiveContainer } from '../../Components/ResponsiveContainer';
import siteService, { Site } from '../../../services/site';

export const WhitelistSites: FC = () => {
  const initialData = useLoaderData() as Site[];
  const [sites, sitesActions] = useList(initialData);
  const navigate = useNavigate();
  const removeSite = (site: Site, index: number) => async () => {
    await siteService.removeSites(site);
    sitesActions.removeAt(index);
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
        {sites.map((site, index) => (
          <Flex key={site.url} w="100%" mb="16px">
            <Avatar flexGrow={0} name={site.name} />
            <Flex ml="16px" flex={1} fontSize="lg" alignItems="center">
              {site.name}
            </Flex>
            <IconButton
              flex={0}
              borderRadius="16px"
              aria-label="delete"
              icon={<DeleteIcon />}
              onClick={removeSite(site, index)}
            >
              Remove
            </IconButton>
          </Flex>
        ))}
      </Flex>
    </ResponsiveContainer>
  );
};
