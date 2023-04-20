import React, { FC, useMemo, useState } from 'react';
import {
  Flex,
  VStack,
  Center,
  Box,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Highlight,
  Skeleton,
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon, SearchIcon } from '@chakra-ui/icons';
import { useMutation } from '@tanstack/react-query';

import { WhiteAlphaBox } from '../../Components/WhiteAlphaBox';
import { useConfigQuery } from '../../hooks/useConfigQuery';
import { useService } from '../../hooks/useService';
import { SiteFavicon } from '../../Components/SiteFavicon';

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
      <Text as={Box} fontSize="md" mb="20px" w="100%">
        {configQuery.data?.nickname} is connected to these sites. They can view your account address
      </Text>
      <InputGroup alignItems="center" h="60px" mb="20px">
        <InputLeftElement
          borderRadius="8px"
          top="10px"
          left="6px"
          w="40px"
          h="40px"
          backgroundColor="purple.500"
          as={Center}
        >
          <SearchIcon w="24px" h="24px" />
        </InputLeftElement>
        <Input
          data-test-id="siteSearch"
          size="lg"
          w="452px"
          background="transparent"
          color="white"
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
          h="60px"
          pl="48px"
        />
      </InputGroup>
      {!filteredSites?.length ? (
        <Center as={WhiteAlphaBox} data-test-id="siteList" h="288px">
          <Box color="whiteAlpha.700" height="20px" fontSize="sm">
            No whitelist sites found.
          </Box>
        </Center>
      ) : (
        <VStack
          data-test-id="siteList"
          overflowY="auto"
          padding="30px 20px"
          as={WhiteAlphaBox}
          spacing="12px"
          h="288px"
          flexDirection="column"
        >
          {filteredSites?.map((site, index) => (
            <Flex data-test-id={`site[${index}]`} alignItems="center" h="48px" w="100%" key={site.host}>
              <Center w="48px" borderRadius="50%" padding="4px" h="48px" backgroundColor="whiteAlpha.300">
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
            </Flex>
          ))}
        </VStack>
      )}
    </Skeleton>
  );
};
