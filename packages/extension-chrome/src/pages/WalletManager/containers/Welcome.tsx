import React, { FC, useEffect } from 'react';
import { HStack, Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import HardDrive from '../../Components/icons/HardDrive.svg';
import { PlusSquareIcon } from '@chakra-ui/icons';
import { Text, Card, Heading, Button, Spacer } from '@chakra-ui/react';
import { useWalletCreationStore } from '../store';

export const Welcome: FC = () => {
  const navigate = useNavigate();
  const resetStore = useWalletCreationStore((s) => s.reset);

  useEffect(() => {
    resetStore();
  }, [resetStore]);
  const enterCreatePage = (createNew: boolean) => () => {
    if (createNew) {
      navigate('/beforeStart');
    } else {
      navigate('/import/seed');
    }
  };

  const cards = [
    {
      heading: 'Yes. Let’s get set up!',
      desc: 'This will create a new wallet',
      actionText: 'Create a Wallet',
      width: '352px',
      paddingX: '16px',
      icon: <PlusSquareIcon color="purple.300" w="40px" h="40px" />,
      testId: 'createWallet',
      action: enterCreatePage(true),
    },
    {
      heading: 'No, I already have a wallet',
      desc: 'Import your existing wallet using Seed',
      actionText: 'Import wallet',
      width: '324px',
      paddingX: '68px',
      testId: 'importWallet',
      icon: <Icon w="40px" h="40px" viewBox="0 0 40 40" as={HardDrive} />,
      action: enterCreatePage(false),
    },
  ];

  return (
    <>
      <Spacer />
      <Heading marginBottom="48px">New to Nexus?</Heading>

      <HStack spacing="36px">
        {cards.map(({ heading, desc, action, actionText, width, icon, testId }) => (
          <Card key={heading} direction="column" alignItems="center" h="294px" justifyContent="center" w={width}>
            {icon}
            <Heading marginTop="16px" fontSize="xl">
              {heading}
            </Heading>
            <Text mt="16px" fontSize="md">
              {desc}
            </Text>
            <Button data-test-id={testId} marginTop="32px" onClick={action}>
              {actionText}
            </Button>
          </Card>
        ))}
      </HStack>
      <Spacer />
    </>
  );
};
