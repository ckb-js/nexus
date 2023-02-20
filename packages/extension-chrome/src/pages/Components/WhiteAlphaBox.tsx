import React, { FC } from 'react';

import { Flex, FlexProps } from '@chakra-ui/react';

export const WhiteAlphaBox: FC<FlexProps> = ({ children, ...props }) => {
  return (
    <Flex backgroundColor="whiteAlpha.200" w="452px" borderRadius="8px" {...props}>
      {children}
    </Flex>
  );
};
