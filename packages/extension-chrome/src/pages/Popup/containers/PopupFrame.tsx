import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, Flex } from '@chakra-ui/react';
import React, { FC } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../../Components/Logo';

const navigatorTitleMap: Record<string, string | undefined> = {
  '/whitelistSites': 'Whitelist Sites',
  '/network': 'Networks',
  '/network/add': 'Networks',
};

export const PopupFrame: FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHomePage = pathname === '/';
  const navigatorTitle = navigatorTitleMap[pathname];
  const goBack = () => {
    navigate(-1);
  };

  return (
    <Flex
      pt="44px"
      alignItems="center"
      direction="column"
      backgroundColor="purple.700"
      position="relative"
      h="100vh"
      w="100vw"
      p={isHomePage ? '0' : '28px 24px 0'}
      pb="72px"
      color="white"
    >
      {!isHomePage && (
        <Flex mb="32px" alignItems="center" w="100%">
          <ArrowBackIcon onClick={goBack} mr="12px" cursor="pointer" w="24px" h="24px" />
          <Box height="32px" fontSize="2xl" fontWeight="semibold">
            {navigatorTitle}
          </Box>
        </Flex>
      )}
      <Logo position="absolute" left="24px" bottom="20px" />
      <Outlet />
    </Flex>
  );
};
