import React, { FC } from 'react';
import { Card, ListItem, Heading, Text, UnorderedList, ListIcon, Button, Center } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CircleMarker } from '../../Components/CircleMarker';

const texts = [
  'We do not send any clicks, page views or events to a central server',
  'We do not use any trackers or analytics',
  'We don’t collect keys, addresses or any information - your information never leaves this machine',
];

export const BeforeStart: FC = () => {
  const navigate = useNavigate();
  return (
    <Center flexDir="column">
      <Heading mb="48px" fontSize="4xl" fontWeight="semibold">
        Before We Start
      </Heading>
      <Text fontSize="16px" w="568px">
        We want you to know that we prioritize your privacy:
      </Text>
      <Card borderRadius="8px" my="12px" w="568px" p="20px">
        <UnorderedList spacing="12px" ml="0">
          {texts.map((t) => (
            <ListItem display="flex" fontSize="md" key={t}>
              <ListIcon as={CircleMarker} mt="4px" />
              {t}
            </ListItem>
          ))}
        </UnorderedList>
      </Card>
      <Text w="568px" fontSize="16px" mb="72px">
        We are not in the information collection business (even anonymous data).
      </Text>

      <Button
        onClick={() => {
          navigate('/create/account');
        }}
        data-test-id="getStarted"
        size="lg"
        w="148px"
      >
        Get Started
      </Button>
    </Center>
  );
};
