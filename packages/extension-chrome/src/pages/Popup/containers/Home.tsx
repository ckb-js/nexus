import React, { FC } from 'react';
import { Button, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer } from '../../Components/ResponsiveContainer';

export const Home: FC = () => {
  const navigate = useNavigate();
  return (
    <ResponsiveContainer h="100%" centerContent>
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
      </Flex>
    </ResponsiveContainer>
  );
};
