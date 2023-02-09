import React, { FC } from 'react';
import { Container, ContainerProps } from '@chakra-ui/react';

export const ResponsiveContainer: FC<ContainerProps> = ({ ...props }) => {
  return <Container minW={{ base: '360px', md: '100vw' }} height="100%" {...props} />;
};
