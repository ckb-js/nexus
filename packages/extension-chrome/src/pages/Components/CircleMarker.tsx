import { Box, BoxProps } from '@chakra-ui/react';
import React, { FC } from 'react';

export const CircleMarker: FC<BoxProps> = (props) => (
  <Box as="span" w="20px" h="20px" borderRadius="50%" background="purple.500" {...props} />
);
