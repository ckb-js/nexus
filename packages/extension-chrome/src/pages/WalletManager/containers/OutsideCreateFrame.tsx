import React, { FC } from 'react';
import { Center } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Logo } from '../../Components/Logo';

export const OutsideCreateFrame: FC = () => {
  return (
    <Center
      width="100%"
      color="blackAlpha.900"
      backgroundColor="gray.50"
      flexDirection="column"
      height="100%"
      position="relative"
    >
      <Logo position="absolute" variant="filled" left="80px" top="48px" />
      <Outlet />
    </Center>
  );
};
