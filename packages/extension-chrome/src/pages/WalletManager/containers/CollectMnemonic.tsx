import { FormControl, Input, FormHelperText, FormLabel, Flex, Grid, Text } from '@chakra-ui/react';
import times from 'lodash.times';
import React from 'react';
import { FC, ReactElement } from 'react';
import { useList } from 'react-use';
import { ResponsiveContainer } from '../../Components/ResponsiveContainer';
import { useWalletManagerStore } from '../store';
import {} from 'react-query';

/**
 * Confirm the mnemonic
 */
export const CollectMnemonic: FC = () => {
  const store = useWalletManagerStore();
  const [userInputs, inputsAction] = useList(times(12, () => ''));

  const isRecoveryMode = store.mnemonic.length === 0;

  let inputs: ReactElement[];

  if (!isRecoveryMode) {
    const { confirmPositions: checkingPositions } = store;
    inputs = store.mnemonic.map((word, index) => {
      const shouldFill = checkingPositions.has(index);
      return (
        <FormControl>
          <Input
            key={index}
            value={shouldFill ? userInputs[index] : word}
            disabled={!shouldFill}
            onChange={
              shouldFill
                ? (e) => {
                    inputsAction.updateAt(index, e.target.value);
                  }
                : undefined
            }
          />

          {shouldFill && userInputs[index] && userInputs[index] !== word && (
            <FormHelperText color="red.500">Wrong word</FormHelperText>
          )}
        </FormControl>
      );
    });
  } else {
    inputs = times(12, (index) => (
      <FormControl>
        <FormLabel>Word {index + 1}</FormLabel>
        <Input
          value={userInputs[index]}
          key={index}
          onChange={(e) => {
            inputsAction.updateAt(index, e.target.value);
          }}
        />
      </FormControl>
    ));
  }

  return (
    <ResponsiveContainer centerContent>
      <Flex direction="column" alignItems="center">
        <Text fontSize="2xl">
          {isRecoveryMode
            ? 'Please input your recovery mnemonic'
            : 'Please fill the missing words of previous mnemonic'}
        </Text>
        <Grid gridGap="16px" gridTemplate="repeat(5, auto) / repeat(3, 1fr)">
          {inputs}
        </Grid>
      </Flex>
    </ResponsiveContainer>
  );
};
