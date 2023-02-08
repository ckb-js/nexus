import React, { FC } from 'react';
import { Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import HardDrive from '../../Components/icons/HardDrive.svg';
import { PlusSquareIcon } from '@chakra-ui/icons';
import { Flex, Text, Card, Heading, Button, Spacer } from '@chakra-ui/react';

export const Welcome: FC = () => {
  const navigate = useNavigate();
  const navigateToMnemonic = (createNew: boolean) => () => {
    if (createNew) {
      navigate('/beforeStart');
    } else {
      navigate('/import/seed');
    }
  };

  const cards = [
    {
      heading: 'No, I already have a wallet',
      desc: 'Import your existing wallet using the Seed',
      actionText: 'Import wallet',
      paddingX: '68px',
      icon: <Icon w="40px" h="40px" viewBox="0 0 40 40" as={HardDrive} />,
      action: navigateToMnemonic(false),
    },
    {
      heading: 'Yes, I want to create a new wallet',
      desc: "Yes, let's get set up!",
      actionText: 'Create a new wallet',
      paddingX: '16px',
      icon: <PlusSquareIcon color="purple.300" w="40px" h="40px" />,
      action: navigateToMnemonic(true),
    },
  ];

  return (
    <>
      <Spacer />
      <Heading marginBottom="48px">New to Nexus?</Heading>

      <Flex flex="1">
        {cards.map(({ heading, desc, action, actionText, paddingX, icon }) => (
          <Card
            mx="12px"
            key={heading}
            direction="column"
            alignItems="center"
            justifyContent="center"
            height="294px"
            paddingY="48px"
            paddingX={paddingX}
          >
            {icon}
            <Text marginTop="16px" fontSize="20px" fontWeight="700">
              {heading}
            </Text>
            <Text fontSize="16px">{desc}</Text>
            <Button marginTop="32px" onClick={action}>
              {actionText}
            </Button>
          </Card>
        ))}
      </Flex>
      <Spacer />
    </>
  );
};
