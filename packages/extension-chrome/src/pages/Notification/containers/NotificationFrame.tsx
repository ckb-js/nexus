import { Flex } from '@chakra-ui/react';
import React, { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { Logo } from '../../Components/Logo';

export const NotificationFrame: FC = () => {
  return (
    <Flex
      alignItems="center"
      direction="column"
      backgroundColor="purple.700"
      position="relative"
      h="100vh"
      w="100vw"
      pb="72px"
      color="white"
    >
      <Logo position="absolute" left="24px" bottom="20px" />
      <Flex px="24px" alignItems="center" w="500px" direction="column" h="100%">
        <Outlet />
      </Flex>
    </Flex>
  );
};
