import React, { FC } from 'react';
import { Flex, Icon, Box, FlexProps } from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { WhiteAlphaBox } from './WhiteAlphaBox';
import AvatarIcon from './icons/Avatar.svg';
import MinusCircle from '../Components/icons/MinusCircle.svg';

export type ConnectStatusCardProps = {
  name: string;
  connected?: boolean;
} & FlexProps;

export const ConnectStatusCard: FC<ConnectStatusCardProps> = ({ name, connected, ...rest }) => {
  return (
    <WhiteAlphaBox
      data-test-id="connectedStatus"
      data-connected={connected}
      alignItems="center"
      h="108px"
      justify="space-between"
      paddingX="30px"
      {...rest}
    >
      <Flex alignItems="center">
        <Icon as={AvatarIcon} mr="16px" viewBox="0 0 96 96" w="48px" h="48px" />
        <Box data-test-id="username" fontWeight="bold" fontSize="md">
          Hi, {name}
        </Box>
      </Flex>

      <Flex alignItems="center">
        {connected !== undefined && (
          <>
            {connected ? (
              <CheckCircleIcon mr="4px" data-test-id="connectedStatusIndicator" w="16px" h="16px" color={'green.300'} />
            ) : (
              <Icon as={MinusCircle} w="16px" h="16px" mr="4px" />
            )}
            <Box fontSize="sm" data-test-id="connectedStatusText">
              {connected ? 'Connected' : 'Disconnected'}
            </Box>
          </>
        )}
      </Flex>
    </WhiteAlphaBox>
  );
};
