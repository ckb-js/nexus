import { Button, Container, Flex, Grid, GridItem, Heading, Spacer, Tag, Text, Skeleton } from '@chakra-ui/react';
import React from 'react';
import { FC } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import walletService from '../../../services/wallet';
import { useWalletManagerStore } from '../store';

export const CreateMnemonic: FC = () => {
  const navigate = useNavigate();
  const store = useWalletManagerStore();

  const {
    isLoading,
    data: mnemonic,
    isError,
  } = useQuery('randomMnemonic', () => {
    return walletService.generateRandomMnemonic();
  });
  const gotoConfirmMnemonic = () => {
    store.setMnemonic(mnemonic!);
    navigate('/confirm', { replace: true });
  };

  return (
    <Container maxW="6xl" height="100%" centerContent>
      <Spacer />
      <Heading marginBottom="48px">Your wallet generation seed is</Heading>
      {isLoading ? (
        <Skeleton height="100px" />
      ) : (
        <Grid gridGap="18px" gridTemplate="repeat(2, auto) / repeat(6, auto)">
          {mnemonic?.map((word) => (
            <GridItem>
              <Tag width="120px" size="lg" colorScheme="green" key={word}>
                {word}
              </Tag>
            </GridItem>
          ))}
        </Grid>
      )}

      <Flex direction="column" width="810px" marginTop="24px">
        <Heading>Tips:</Heading>
        <Text fontSize="lg" marginTop="12px">
          Lost your seed, you will permanently lose access to your wallet.
          <br />
          Please write down your seed and keep it in a safe place.
          <br />
          Don't share your seed with anyone. Your assets will be stolen if you do.
        </Text>
      </Flex>

      <Flex justifyContent="flex-end" width="810px" marginTop="32px">
        <Button
          onClick={() => {
            navigate('/', { replace: true });
          }}
          marginRight="12px"
          size="lg"
          w="120px"
          borderRadius="24px"
          variant="outline"
          colorScheme="green"
        >
          Back
        </Button>
        <Button
          colorScheme="green"
          size="lg"
          w="120px"
          borderRadius="24px"
          disabled={isError || isLoading}
          onClick={gotoConfirmMnemonic}
        >
          Next
        </Button>
      </Flex>
      <Spacer />
    </Container>
  );
};
