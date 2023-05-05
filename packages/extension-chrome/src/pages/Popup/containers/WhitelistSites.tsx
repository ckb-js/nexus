import React, { FC, useMemo, useState } from 'react';
import { Flex, Center, Box, Text, Highlight, Skeleton, useToast, Grid } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useMutation } from '@tanstack/react-query';

import { WhiteAlphaBox } from '../../Components/WhiteAlphaBox';
import { useConfigQuery } from '../../hooks/useConfigQuery';
import { useService } from '../../hooks/useService';
import { SiteFavicon } from '../../Components/SiteFavicon';
import { SearchBar } from '../../Components/SearchBar';

export const WhitelistSites: FC = () => {
  const configQuery = useConfigQuery();
  const toast = useToast();
  const configService = useService('configService');

  const removeWhitelistItemMutation = useMutation({
    mutationFn: async (host: string) => {
      return configService.removeWhitelistItem({ host });
    },
  });

  const removeSite = (host: string) => async () => {
    try {
      await removeWhitelistItemMutation.mutateAsync(host);
    } catch {
      toast({ title: "Can't remove the site" });
    } finally {
      await configQuery.invalidate();
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSites = useMemo(
    () => configQuery.data?.whitelist.filter((d) => d.host.includes(searchQuery)),
    [configQuery.data?.whitelist, searchQuery],
  );

  return (
    <Skeleton isLoaded={!!filteredSites}>
      <Text as={Box} fontSize="md" mb="24px" w="100%">
        {configQuery.data?.nickname} is connected to these sites. They can view your account address
      </Text>
      <SearchBar mb="24px" onChange={(e) => setSearchQuery(e.target.value)} value={searchQuery} />
      {!filteredSites?.length ? (
        <Center as={WhiteAlphaBox} data-test-id="siteList" h="268px">
          <Box color="whiteAlpha.700" height="20px" fontSize="sm">
            No whitelist sites found.
          </Box>
        </Center>
      ) : (
        <Grid
          data-test-id="siteList"
          overflowY="auto"
          as={WhiteAlphaBox}
          h="268px"
          flexDirection="column"
          templateRows="repeat(3, 64px)"
          autoRows="64px"
          py="8px"
        >
          {filteredSites?.map((site, index) => (
            <Flex
              _hover={{ background: 'white.200' }}
              data-test-id={`site[${index}]`}
              alignItems="center"
              h="100%"
              w="100%"
              p="8px 20px"
              key={site.host}
            >
              <Center w="100%">
                <Center w="48px" borderRadius="50%" padding="4px" h="48px" backgroundColor="white.200">
                  <SiteFavicon data-test-id={`site[${index}].favicon`} size={32} host={site.host} />
                </Center>
                <Flex ml="20px" data-test-id={`site[${index}].url`} flex={1} fontSize="lg" alignItems="center">
                  <Highlight query={searchQuery} styles={{ bg: 'white' }}>
                    {site.host}
                  </Highlight>
                </Flex>
                <DeleteIcon
                  data-test-id={`site[${index}].remove`}
                  cursor="pointer"
                  w="20px"
                  h="20px"
                  onClick={removeSite(site.host)}
                />
              </Center>
            </Flex>
          ))}
        </Grid>
      )}
    </Skeleton>
  );
};
