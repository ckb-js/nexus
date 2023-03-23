import React, { FC } from 'react';

import { Flex, FlexProps } from '@chakra-ui/react';

export const WhiteAlphaBox: FC<FlexProps> = ({ children, sx, ...props }) => {
  return (
    <Flex
      backgroundColor="whiteAlpha.200"
      w="452px"
      borderRadius="8px"
      sx={{
        '::-webkit-scrollbar': {
          backgroundColor: 'transparent',
          w: '5px',
        },
        '::-webkit-scrollbar-thumb': {
          borderRadius: '30px',
          backgroundColor: 'purple.500',
        },

        ...sx,
      }}
      {...props}
    >
      {children}
    </Flex>
  );
};
