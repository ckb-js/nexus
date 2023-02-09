import React, { FC } from 'react';
import { Flex, Box, Icon, Center } from '@chakra-ui/react';
import TerminalIcon from '../../Components/icons/Terminal.svg';
import NetworkIcon from '../../Components/icons/Network.svg';
import { useNavigate } from 'react-router-dom';
import { WhiteAlphaBox } from '../../Components/WhiteAlphaBox';
import { ConnectStatusCard } from '../../Components/ConnectStatusCard';

export const Home: FC = () => {
  const navigate = useNavigate();

  const entries = [
    {
      title: 'Whitelist Sites',
      onClick: () => {
        navigate('/whitelistSites');
      },
      icon: <Icon as={TerminalIcon} viewBox="0 0 24 24" w="24px" h="24px" />,
    },
    {
      title: 'Network',
      onClick: () => {
        navigate('/network');
      },
      icon: <Icon as={NetworkIcon} viewBox="0 0 24 24" w="24px" h="24px" />,
    },
  ];

  return (
    <>
      <ConnectStatusCard name="Yan" status="connected" />

      <WhiteAlphaBox w="450px" direction="column">
        {entries.map(({ title, icon, onClick }) => (
          <Flex as="button" alignItems="center" paddingX="30px" h="88px" onClick={onClick}>
            <Center mr="20px" w="48px" backgroundColor="whiteAlpha.300" h="48px" borderRadius="50%">
              {icon}
            </Center>
            <Box fontSize="md" fontWeight="semibold">
              {title}
            </Box>
          </Flex>
        ))}
      </WhiteAlphaBox>

      {/* <Flex w="100%" mt="24px" alignItems="center">
        <Box mr="8px" height="24px" borderRadius="50%" width="24px" backgroundColor="green.400"></Box>
        <Text fontSize="md">Site Connects</Text>
      </Flex>
      <Flex h="100%" direction="column" alignItems="center" justifyContent="center">
        <Button
          w="150px"
          onClick={() => {
            navigate('/whitelistSites');
          }}
        >
          Whitelist Sites
        </Button>
        <Button
          w="150px"
          mt="24px"
          onClick={() => {
            navigate('network');
          }}
        >
          Networks
        </Button>
      </Flex> */}
    </>
  );
};
