import { Box, BoxProps, HStack } from '@chakra-ui/react';
import range from 'lodash.range';
import React, { FC } from 'react';

export type ProgressIndicatorProps = { total: number; current: number } & BoxProps;

export const ProcessIndicator: FC<ProgressIndicatorProps> = ({ total, current }) => {
  const getIndicatorColor = (index: number) => {
    if (index < current) {
      return 'primary.lighter';
    } else if (index > current) {
      return 'gray.300';
    }
    return 'primary';
  };
  return (
    <HStack spacing="12px" paddingY="4px" mb="48px">
      {range(0, total).map((index) => (
        <Box
          transitionProperty="background"
          transitionDuration="common"
          key={index}
          w="66px"
          h="5px"
          borderRadius="5px"
          backgroundColor={getIndicatorColor(index)}
        />
      ))}
    </HStack>
  );
};
