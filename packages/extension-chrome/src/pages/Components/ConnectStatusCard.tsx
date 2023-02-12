import React, { FC } from 'react';
import { Flex, Icon, Box, FlexProps } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { WhiteAlphaBox } from './WhiteAlphaBox';
import AvatarIcon from './icons/Avatar.svg';

export type ConnectStatusCardProps = {
  name: string;
  connected?: boolean;
} & FlexProps;

export const ConnectStatusCard: FC<ConnectStatusCardProps> = ({ name, connected, ...rest }) => {
  return (
    <WhiteAlphaBox alignItems="center" h="108px" justify="space-between" paddingX="30px" {...rest}>
      <Flex alignItems="center">
        <Icon as={AvatarIcon} mr="16px" viewBox="0 0 96 96" w="48px" h="48px" />
        <Box fontWeight="bold" fontSize="md">
          Hi, {name}
        </Box>
      </Flex>

      <Flex alignItems="center">
        <CheckCircleIcon mr="4px" color={'green.300'} />
        <Box fontSize="sm">{connected ? 'Connected' : 'Disconnected'}</Box>
      </Flex>
    </WhiteAlphaBox>
  );
};
