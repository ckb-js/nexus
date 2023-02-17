import { Badge, Box, Button, Heading, SimpleGrid, Textarea } from '@chakra-ui/react';
import React, { FC, ReactElement, useEffect, useMemo } from 'react';
import { useList } from 'react-use';
import shuffle from 'lodash.shuffle';
import zip from 'lodash.zip';
import { useWalletCreationStore } from '../store';
import range from 'lodash.range';
import { useOutletContext } from './CreateProcessFrame';

export const ConfirmMnemonic: FC = () => {
  const { initWallet, seed } = useWalletCreationStore();
  const { setNextAvailable, whenSubmit } = useOutletContext();

  useEffect(() => {
    whenSubmit(async () => {
      await initWallet();
    });
  }, [initWallet, whenSubmit]);

  const confirmPositions = useMemo(() => shuffle(range(0, seed.length)), [seed]);

  const word4Choose = Array.from(confirmPositions).map((index) => seed?.[index]);

  const [chosenIndex, chosenIndexAction] = useList<number>([]);

  const removeChosenIndex = (index: number) => () => {
    chosenIndexAction.removeAt(chosenIndex.findIndex((i) => i === index));
  };

  const addChosenIndex = (index: number) => () => {
    chosenIndexAction.push(index);
  };

  const chosenWords = useMemo(() => chosenIndex.map((index) => word4Choose[index]), [chosenIndex, word4Choose]);

  const { wordElements, isAllCorrect } = useMemo(() => {
    const wordElements: ReactElement[] = [];
    let isAllCorrect = chosenWords.length === seed.length;
    zip(chosenWords, seed).forEach(([chosenWord, seedWord], index) => {
      const isCorrect = chosenWord === seedWord;
      if (!isCorrect) {
        isAllCorrect = false;
      }
      wordElements.push(
        <Box as="span" key={index} data-test-id={`selectedSeed[${index}]`} color={isCorrect ? 'black' : 'red'}>
          {chosenWord}{' '}
        </Box>,
      );
    });

    return {
      isAllCorrect,
      wordElements,
    };
  }, [chosenWords, seed]);

  useEffect(() => {
    setNextAvailable(isAllCorrect);
  }, [isAllCorrect, setNextAvailable]);

  return (
    <>
      <Heading mb="48px" lineHeight="111%" fontWeight="semibold">
        Confirm your Seed
      </Heading>
      <Box fontSize="md" w="480px" mb="8px">
        Please select words below to form the correct Seed.
      </Box>

      <Textarea data-test-id="selectedSeed" as="div" w="480px" h="200px">
        {wordElements}
      </Textarea>

      <SimpleGrid spacing="12px" marginTop="32px" columns={4} w="480px">
        {word4Choose.map((word, index) => {
          const chosenOrder = chosenIndex.findIndex((i) => i === index);
          const hasChosen = chosenOrder !== -1;
          return (
            <Box position="relative" key={word} data-test-id={`seed[${index}]`} data-test-selected={hasChosen}>
              {hasChosen && (
                <Badge
                  borderRadius="18px"
                  w="18px"
                  h="18px"
                  colorScheme="purple"
                  position="absolute"
                  top="-4px"
                  right="-4px"
                  zIndex="1"
                >
                  {chosenOrder + 1}
                </Badge>
              )}
              <Button
                size="lg"
                w="108px"
                variant={hasChosen ? 'solid' : 'outline'}
                onClick={hasChosen ? removeChosenIndex(index) : addChosenIndex(index)}
                // for preventing the button size change
                borderWidth="1px"
              >
                {word}
              </Button>
            </Box>
          );
        })}
      </SimpleGrid>
    </>
  );
};
