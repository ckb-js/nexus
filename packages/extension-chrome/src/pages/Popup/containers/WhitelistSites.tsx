import React, { FC, useMemo, useState } from 'react';
import {
  Flex,
  VStack,
  Image,
  Center,
  Box,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Highlight,
} from '@chakra-ui/react';
import { DeleteIcon, SearchIcon } from '@chakra-ui/icons';

// TODO: use real service
import configService from '../../../mockServices/config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { WhiteAlphaBox } from '../../Components/WhiteAlphaBox';

export const WhitelistSites: FC = () => {
  const whitelistSiteQuery = useQuery({
    queryKey: ['whitelist'],
    queryFn: () => configService.getWhitelist(),
  });

  const removeWhitelistSiteMutation = useMutation({
    mutationFn: (url: string) => configService.removeWhitelistItem({ url: url }),
  });

  const removeSite = (site: string) => async () => {
    await removeWhitelistSiteMutation.mutateAsync(site);
    await whitelistSiteQuery.refetch();
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSites = useMemo(
    () => whitelistSiteQuery.data?.filter((d) => d.url.includes(searchQuery)),
    [whitelistSiteQuery.data, searchQuery],
  );

  return (
    <>
      <Text as={Box} fontSize="md" mb="20px" w="100%">
        Yan is connected to these sites. They can view your account address
      </Text>
      <InputGroup alignItems="center" mb="20px">
        <InputLeftElement
          borderRadius="8px"
          w="40px"
          h="40px"
          backgroundColor="purple.500"
          top="4px"
          left="4px"
          as={Center}
        >
          <SearchIcon w="24px" h="24px" />
        </InputLeftElement>
        <Input
          size="lg"
          w="452px"
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
          colorScheme="white"
          pl="48px"
        />
      </InputGroup>
      <VStack padding="30px 20px" as={WhiteAlphaBox} spacing="12px" flexDirection="column">
        {filteredSites?.map((site) => (
          <Flex alignItems="center" h="48px" w="100%" key={site.url}>
            <Center w="48px" borderRadius="50%" padding="4px" h="48px" backgroundColor="whiteAlpha.300">
              <Image w="32px" h="32px" src={site.favicon} />
            </Center>
            <Flex ml="20px" flex={1} fontSize="lg" alignItems="center">
              <Highlight query={searchQuery} styles={{ bg: 'orange.200' }}>
                {site.url}
              </Highlight>
            </Flex>
            <DeleteIcon cursor="pointer" w="24px" h="24px" onClick={removeSite(site.url)} />
          </Flex>
        ))}
      </VStack>
    </>
  );
};
