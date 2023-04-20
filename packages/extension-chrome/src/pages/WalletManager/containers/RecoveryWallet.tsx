import {
  FormControl,
  Input,
  FormLabel,
  Flex,
  Grid,
  Text,
  Heading,
  Box,
  Alert,
  AlertIcon,
  AlertDescription,
  InputProps,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import times from 'lodash.times';
import React, { useCallback, useEffect, useRef, FC } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import wordList from '@ckb-lumos/hd/lib/mnemonic/word_list';
import { useWalletCreationStore } from '../store';
import { useOutletContext } from './CreateProcessFrame';
import { useClickAway, useToggle } from 'react-use';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const MNEMONIC_LENGTH = 12;

const wordSet = new Set(wordList);

const validateWordInList = (word: string) => {
  return wordSet.has(word);
};

type FormFields = { seed: { value: string }[] };

const PasswordInput: FC<Omit<InputProps, 'type'>> = ({ onFocus: _onFocus, ...restProps }) => {
  const [reveal, toggleRevealState] = useToggle(false);
  const [focused, setFocused] = useToggle(false);
  const inputGroupRef = useRef<HTMLInputElement>(null);
  const EyeIcon = reveal ? ViewOffIcon : ViewIcon;
  useClickAway(inputGroupRef, () => {
    setFocused(false);
    toggleRevealState(false);
  });
  const onFocus: React.FocusEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setFocused(true);
      _onFocus?.(e);
    },
    [_onFocus, setFocused],
  );

  const toggleVisible: React.MouseEventHandler<SVGElement> = () => {
    toggleRevealState();
  };

  return (
    <InputGroup ref={inputGroupRef}>
      <Input type={reveal ? 'text' : 'password'} onFocus={onFocus} {...restProps} />
      <InputRightElement>
        <EyeIcon display={focused ? 'block' : 'none'} cursor="pointer" mr="12px" onClick={toggleVisible} />
      </InputRightElement>
    </InputGroup>
  );
};

/**
 * Confirm the mnemonic
 */
export const RecoveryWallet: FC = () => {
  const setStoreState = useWalletCreationStore((s) => s.set);
  const { formState, handleSubmit, control, setValue } = useForm<FormFields>({
    values: {
      seed: times(MNEMONIC_LENGTH, () => ({ value: '' })),
    },
    mode: 'onChange',
  });

  const { fields } = useFieldArray({
    control,
    name: 'seed',
  });
  const { setNextAvailable, whenSubmit } = useOutletContext();

  useEffect(() => {
    whenSubmit(
      handleSubmit((values) => {
        setStoreState({ seed: values.seed.map((s) => s.value) });
      }),
    );
  }, [whenSubmit, handleSubmit, setStoreState]);

  useEffect(() => {
    setNextAvailable(formState.isValid);
  }, [formState.isValid, setNextAvailable]);
  const fillSeedSequence = (seedSequence: string) => {
    seedSequence
      .split(/\s+/)
      .slice(0, MNEMONIC_LENGTH)
      .forEach((seed, index) => {
        setValue(`seed.${index}.value`, seed.trim().toLowerCase(), { shouldValidate: true, shouldDirty: true });
      });
  };

  const inputs = fields.map((field, index) => {
    return (
      <Controller
        control={control}
        key={field.id}
        name={`seed.${index}.value`}
        rules={{
          required: true,
          validate: {
            wordInList: validateWordInList,
          },
        }}
        render={({ field, fieldState }) => (
          <FormControl isInvalid={fieldState.invalid && field.value.length > 0} as={Flex} alignItems="center">
            <FormLabel mr="8px" w="16px">
              {`${index + 1}`.padStart(2, ' ')}
            </FormLabel>
            <PasswordInput
              mr="8px"
              autoFocus={index === 0}
              w="186px"
              data-test-id={`seed[${index}]`}
              {...field}
              onChange={(e) => {
                if (/\s/.test(e.target.value)) {
                  fillSeedSequence(e.target.value);
                } else {
                  field.onChange(e);
                }
              }}
            />
          </FormControl>
        )}
      />
    );
  });

  return (
    <>
      <Heading fontWeight="semibold" lineHeight="111%" mb="48px">
        Access Wallet With Your Seed
      </Heading>
      <Text lineHeight="6" fontSize="md" mb="16px" w="672px">
        Nexus cannot recover your password. We will use your Seed to validate your ownership, restore your wallet and
        set up a new password. First, enter the Seed that you were given when you created your wallet.
      </Text>

      <Text fontSize="md" mb="16px" fontWeight="extrabold" w="672px" as={Box}>
        Type your Seed here
      </Text>
      <Alert mb="16px" status="info">
        <AlertIcon />
        <AlertDescription fontSize="md">You can paste your entire Seed into any field</AlertDescription>
      </Alert>
      <Box display="grid">
        <Grid w="672px" templateColumns="repeat(3, 1fr)" column={3} gap="12px">
          {inputs}
        </Grid>
      </Box>
      <Controller
        control={control}
        name="seed"
        render={({ formState }) => {
          const { errors, isValid } = formState;
          const hasInvalidWord =
            !isValid &&
            times(MNEMONIC_LENGTH, (i) => errors.seed?.[i]?.value?.type).some(
              (t) => t !== undefined && t !== 'required',
            );

          return (
            <>
              {hasInvalidWord && (
                <Alert mt="16px" status="error">
                  <AlertIcon />
                  <AlertDescription fontSize="md">Please check your Seed</AlertDescription>
                </Alert>
              )}
            </>
          );
        }}
      />
    </>
  );
};
