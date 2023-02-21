import { Box, Button, Heading } from '@chakra-ui/react';
import Particle from '../../assets/Particle.svg';
import React, { FC } from 'react';

export const Success: FC = () => {
  return (
    <>
      <Box as={Particle} mb="48px" />
      <Heading mb="48px">Congratulations!</Heading>
      <Box mb="48px" fontSize="md">
        You are all set! Keep your Seed safe – it’s your responsibility!
      </Box>
      <Button data-test-id="done" onClick={() => window.close()}>
        All Done
      </Button>
    </>
  );
};
