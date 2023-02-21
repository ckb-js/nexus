import React, { FC } from 'react';
import { Card, Box, ListItem, Heading, Text, UnorderedList, ListIcon, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Marker: FC = (props) => <Box as="span" w="20px" h="20px" borderRadius="50%" background="purple.500" {...props} />;

const texts = [
  'We do not send any clicks, page views or events to a central server',
  'We do not use any trackers or analytics',
  'We don’t collect keys, addresses or any information - your information never leaves this machine',
];

export const BeforeStart: FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <Heading mb="48px" fontSize="4xl" fontWeight="semibold">
        Before We Start
      </Heading>
      <Text fontSize="16px" w="568px">
        We want you to know that we prioritize your privacy:
      </Text>
      <Card borderRadius="8px" my="12px" w="568px" p="20px">
        <UnorderedList spacing="12px">
          {texts.map((t) => (
            <ListItem display="flex" fontSize="md" key={t}>
              <ListIcon as={Marker} mt="4px" />
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
    </>
  );
};
