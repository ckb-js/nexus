import React, { FC } from 'react';
import { Button, Container, Flex, FormControl, FormLabel, Input, Spacer, FormErrorMessage } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSetState } from 'react-use';
import { useMutation } from '@tanstack/react-query';
import { useWalletManagerStore } from '../store';

// TODO: use real service
import walletService from '../../../mockServices/wallet';

export const PasswordInputs: FC<{ onChange: (isValid: boolean, value: string) => void }> = ({
  onChange: externalOnchange,
}) => {
  const [state, setState] = useSetState({ password: '', confirmPassword: '' });
  const isValid = !state.confirmPassword || (state.password === state.confirmPassword && state.password.length >= 8);

  const onChange = (field: 'password' | 'confirmPassword') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ [field]: e.target.value });
    externalOnchange(isValid, state.password);
  };

  return (
    <Flex direction="column" width="100%">
      <FormControl>
        <FormLabel>New password(8 character min)</FormLabel>
        <Input value={state.password} onChange={onChange('password')} size="lg" type="password" name="password" />
      </FormControl>
      <FormControl minH="108px" isInvalid={!isValid}>
        <FormLabel>Confirm password</FormLabel>
        <Input
          onChange={onChange('confirmPassword')}
          value={state.confirmPassword}
          size="lg"
          type="password"
          name="confirmPassword"
        />
        <FormErrorMessage>Password are not correspond</FormErrorMessage>
      </FormControl>
    </Flex>
  );
};

export const SetPassword: FC = () => {
  const navigate = useNavigate();
  const { mnemonic } = useWalletManagerStore();
  const [state, setState] = useSetState({ isValid: false, value: '' });
  const password = state.value;
  const onPasswordChange = (isValid: boolean, value: string) => {
    setState({ isValid, value });
    if (isValid) {
      setState({ value });
    }
  };

  const createWallet = useMutation({
    mutationFn: ({ mnemonic, password }: { mnemonic: string[]; password: string }) =>
      walletService.createNewWallet(mnemonic, password),
  });

  const onCreateWallet = async () => {
    if (state.isValid) {
      await createWallet.mutateAsync({ mnemonic, password });
      navigate('/success', { replace: true });
    }
  };

  return (
    <Container centerContent maxW="6xl" height="100%">
      <Spacer />
      <Flex direction="column" w="100%" maxW="400px">
        <PasswordInputs onChange={onPasswordChange} />
      </Flex>
      <Flex direction="column">
        <Button onClick={onCreateWallet} size="lg" mt="24px" w="300px" borderRadius="48px" colorScheme="green">
          Create
        </Button>
        <Button
          onClick={() => {
            navigate('/create', { replace: true });
          }}
          size="lg"
          mt="12px"
          w="300px"
          borderRadius="48px"
          colorScheme="green"
          variant="outline"
        >
          Back
        </Button>
      </Flex>
      <Spacer />
    </Container>
  );
};
