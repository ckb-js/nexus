import React, { FC } from 'react';
import { Flex, Box, Icon, Center, Link, Button, ButtonProps } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import TerminalIcon from '../../Components/icons/Terminal.svg';
import NetworkIcon from '../../Components/icons/Network.svg';
import { WhiteAlphaBox } from '../../Components/WhiteAlphaBox';
import { ConnectStatusCard } from '../../Components/ConnectStatusCard';
import { useConfigQuery } from '../../hooks/useConfigQuery';
import { useService } from '../../hooks/useService';
import { useQuery } from '@tanstack/react-query';

const FeedbackButton: FC<ButtonProps> = (props) => {
  return (
    <Button size="xs" {...props} as="a">
      Feedback
    </Button>
  );
};

const useConnectedStatus = () => {
  const configService = useService('configService');
  const platformService = useService('platformService');

  const hasGrantedQuery = useQuery({
    queryKey: ['hasGranted'],
    queryFn: async () => {
      // TODO: use GrantService to check if the current site is granted
      const whitelist = await configService.getWhitelist();
      const activeSite = await platformService.getActiveSiteInfo();
      if (!activeSite?.url) {
        return false;
      }

      const siteHost = new URL(activeSite.url).host;
      return whitelist.some((item) => item.host === siteHost);
    },
  });

  return hasGrantedQuery.data;
};

export const Home: FC = () => {
  const navigate = useNavigate();
  const { data: config } = useConfigQuery();
  const connectedStatus = useConnectedStatus();

  const entries = [
    {
      title: 'Whitelist Sites',
      onClick: () => {
        navigate('/whitelist-sites');
      },
      testId: 'whitelistSites',
      icon: <Icon as={TerminalIcon} viewBox="0 0 24 24" w="24px" h="24px" />,
    },
    {
      title: 'Network',
      onClick: () => {
        navigate('/network');
      },
      testId: 'network',
      icon: <Icon as={NetworkIcon} viewBox="0 0 24 24" w="24px" h="24px" />,
    },
  ];

  return (
    <Flex flexDir="column" h="100%">
      <ConnectStatusCard name={config?.nickname!} connected={connectedStatus} />

      <WhiteAlphaBox direction="column" mt="20px">
        {entries.map(({ title, icon, onClick, testId }) => (
          <Flex
            key={testId}
            data-test-id={testId}
            as="button"
            alignItems="center"
            px="30px"
            h="88px"
            onClick={onClick}
            type="button"
          >
            <Center mr="20px" w="48px" backgroundColor="whiteAlpha.300" h="48px" borderRadius="50%">
              {icon}
            </Center>
            <Box fontSize="md" fontWeight="semibold">
              {title}
            </Box>
          </Flex>
        ))}
      </WhiteAlphaBox>
      <Link
        position="absolute"
        as={FeedbackButton}
        target="_blank"
        href="https://github.com/ckb-js/nexus/issues"
        top="448px"
        left="438px"
        transform="rotate(-90deg)"
      />
    </Flex>
  );
};
