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
  Skeleton,
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon, SearchIcon } from '@chakra-ui/icons';
import { useMutation } from '@tanstack/react-query';

import { WhiteAlphaBox } from '../../Components/WhiteAlphaBox';
import { useConfigQuery } from '../../hooks/useConfigQuery';
import { useService } from '../../hooks/useService';

export const WhitelistSites: FC = () => {
  const configQuery = useConfigQuery();
  const toast = useToast();
  const configService = useService('configService');

  const removeWhitelistItemMutation = useMutation({
    mutationFn: (host: string) => {
      return configService.removeWhitelistItem({ host }) as Promise<void>;
    },
  });

  const removeSite = (host: string) => async () => {
    try {
      await removeWhitelistItemMutation.mutateAsync(host);
    } catch {
      toast({ title: "Can't remove the site" });
    } finally {
      await configQuery.refetch();
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
        Yan is connected to these sites. They can view your account address
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
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
          colorScheme="white"
          h="60px"
          pl="48px"
        />
      </InputGroup>
      <VStack
        data-test-id="siteList"
        overflowY="auto"
        padding="30px 20px"
        as={WhiteAlphaBox}
        spacing="16px"
        flexDirection="column"
      >
        {filteredSites?.map((site, index) => (
          <Flex data-test-id={`site[${index}]`} alignItems="center" h="48px" w="100%" key={site.host}>
            <Center w="48px" borderRadius="50%" padding="4px" h="48px" backgroundColor="whiteAlpha.300">
              <Image data-test-id={`site[${index}].favicon`} w="32px" h="32px" src={site.favicon} />
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
    </Skeleton>
  );
};
