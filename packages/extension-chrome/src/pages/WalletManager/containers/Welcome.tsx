import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Text, Container, Card, CardHeader, Heading, CardBody, Button, Center, Spacer } from '@chakra-ui/react';

export const Welcome: FC = () => {
  const navigate = useNavigate();
  const navigateToMnemonic = (createNew: boolean) => () => {
    if (createNew) {
      navigate('/create');
    } else {
      navigate('/import');
    }
  };

  const cards = [
    {
      heading: 'No, I already have a wallet',
      desc: 'Import your existing wallet using the Seed',
      actionText: 'Import wallet',
      action: navigateToMnemonic(false),
    },
    {
      heading: 'Yes, I want to create a new wallet',
      desc: "Yes, let's get set up!",
      actionText: 'Create a new wallet',
      action: navigateToMnemonic(true),
    },
  ];

  return (
    <Container maxW="6xl" height="100%" centerContent>
      <Spacer />
      <Heading marginBottom="240px">New to Nexus?</Heading>

      <Flex flex="1">
        {cards.map(({ heading, desc, action, actionText }) => (
          <Card
            mx="12px"
            key={heading}
            direction="column"
            height="250px"
            width="500px"
            alignItems="center"
            borderRadius="16px"
          >
            <CardHeader>
              <Heading fontSize="2xl">{heading}</Heading>
            </CardHeader>
            <CardBody display="flex" flexDirection="column">
              <Text fontSize="md">{desc}</Text>
              <Center flex="1">
                <Button colorScheme="green" onClick={action}>
                  {actionText}
                </Button>
              </Center>
            </CardBody>
          </Card>
        ))}
      </Flex>
      <Spacer />
    </Container>
  );
};
