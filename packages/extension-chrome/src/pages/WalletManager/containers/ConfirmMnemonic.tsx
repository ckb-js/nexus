import {
  Badge,
  Box,
  Button,
  CloseButton,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Spacer,
  Tag,
  Text,
} from '@chakra-ui/react';
import React, { FC, ReactElement, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useList } from 'react-use';
import { useWalletManagerStore } from '../store';
import { mnemonic as mnemonicUtils } from '@nexus-wallet/utils';

export const ConfirmMnemonic: FC = () => {
  const navigate = useNavigate();
  const { mnemonic } = useWalletManagerStore();

  const confirmPositions = useMemo(() => mnemonicUtils.randomPickMnemonicPositions(mnemonic, 5), [mnemonic]);

  const word4Choose = Array.from(confirmPositions).map((index) => mnemonic?.[index]);

  const [chosenIndex, chosenIndexAction] = useList<number>([]);

  const removeChosenIndex = (index: number) => () => {
    chosenIndexAction.removeAt(chosenIndex.findIndex((i) => i === index));
  };

  const addChosenIndex = (index: number) => () => {
    chosenIndexAction.push(index);
  };

  const mnemonicElements: ReactElement[] = [];
  let currentChosenIndex = 0;
  let correspondWordSum = 0;

  // Don't worry about the compability of `entries`.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/entries#browser_compatibility
  for (const [index, word] of mnemonic.entries()) {
    const shouldConfirm = confirmPositions.has(index);
    const commonProps = { width: '120px', size: 'lg' } as const;

    let tag: ReactElement;
    if (shouldConfirm) {
      const chosenWord = word4Choose[chosenIndex[currentChosenIndex]];

      if (chosenWord) {
        currentChosenIndex++;
        const correct = chosenWord === word;
        if (correct) {
          correspondWordSum++;
        }
        tag = (
          <Tag {...commonProps} colorScheme={correct ? 'green' : 'red'} key={word}>
            {chosenWord}
            {!correct && <CloseButton position="absolute" right="4px" top="4px" />}
          </Tag>
        );
      } else {
        tag = <Tag {...commonProps} colorScheme="gray" key={word} />;
      }
    } else {
      tag = (
        <Tag {...commonProps} colorScheme="green" key={word}>
          {!shouldConfirm && word}
        </Tag>
      );
    }

    mnemonicElements.push(<GridItem key={index}>{tag}</GridItem>);
  }

  return (
    <Container maxW="6xl" height="100%" centerContent>
      <Spacer />
      <Heading marginBottom="48px">Confirm your Seed</Heading>
      <Grid gridGap="18px" gridTemplate="repeat(2, auto) / repeat(6, auto)">
        {mnemonicElements}
      </Grid>

      <Flex direction="column" marginTop="48px">
        <Text fontSize="xl" mb="24px">
          Select the missing word in order
        </Text>
        <Flex>
          {word4Choose.map((word, index) => {
            const chosenOrder = chosenIndex.findIndex((i) => i === index);
            const hasChosen = chosenOrder !== -1;
            return (
              <Box position="relative">
                {hasChosen && (
                  <Badge
                    borderRadius="18px"
                    w="18px"
                    h="18px"
                    colorScheme="green"
                    position="absolute"
                    top="-4px"
                    right="-4px"
                    zIndex="1"
                  >
                    {chosenOrder + 1}
                  </Badge>
                )}
                <Button
                  w="120px"
                  key={word}
                  colorScheme="green"
                  onClick={hasChosen ? removeChosenIndex(index) : addChosenIndex(index)}
                  ml="24px"
                  variant={hasChosen ? 'solid' : 'outline'}
                  // for preventing the button size change
                  borderWidth="1px"
                >
                  {word}
                </Button>
              </Box>
            );
          })}
        </Flex>
      </Flex>

      <Flex justifyContent="flex-end" width="810px" marginTop="32px">
        <Button
          onClick={() => {
            navigate('/create');
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
          disabled={correspondWordSum !== confirmPositions.size}
          onClick={() => {
            navigate('/password');
          }}
          colorScheme="green"
          size="lg"
          w="120px"
          borderRadius="24px"
        >
          Next
        </Button>
      </Flex>
      <Spacer />
    </Container>
  );
};
