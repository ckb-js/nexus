import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { FC, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { WhiteAlphaBox } from '../../Components/WhiteAlphaBox';
import { useCheckPassword } from '../../hooks/useCheckPassword';
import { useSessionMessenger } from '../../hooks/useSessionMessenger';

export const SignData: FC = () => {
  const sessionManager = useSessionMessenger();
  const checkPassword = useCheckPassword();

  const unsignedDataQuery = useQuery({
    queryKey: ['unsignedData', sessionManager.sessionId()],
    queryFn: () => sessionManager.send('session_getUnsignedData'),
  });

  const sendSessionMutation = useMutation({
    mutationFn: async (approve: boolean) => {
      await sessionManager.send(approve ? 'session_approveSignData' : 'session_rejectSignData');
    },
  });

  const { handleSubmit, register, formState, setValue } = useForm({
    mode: 'onSubmit',

    // important, without this will take performance issue
    reValidateMode: 'onSubmit',
    defaultValues: { password: '' },
  });
  const onSubmit = async () => {
    await sendSessionMutation.mutateAsync(true);
    window.close();
  };

  const onInvalid = () => {
    setValue('password', '');
  };

  const validatePassword = useCallback(
    (password: string) => {
      return checkPassword(password);
    },
    [checkPassword],
  );

  return (
    <Skeleton isLoaded={!!unsignedDataQuery.data}>
      <Heading fontSize="2xl" fontWeight="semibold" w="452px" mt="28px">
        Sign Message
      </Heading>

      <WhiteAlphaBox mt="32px" p="16px 20px">
        <Link fontSize="sm">{unsignedDataQuery.data?.url}</Link>
      </WhiteAlphaBox>

      <Box mt="32px" fontWeight="semibold" fontSize="md">
        Only sign this message if you fully understand the content and trust the requesting site.
      </Box>

      <Flex direction="column" as="form" onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <VStack as={WhiteAlphaBox} mt="32px" spacing="12px" alignItems="flex-start" direction="column" p="16px 20px">
          <Heading size="sm" as={Flex} w="100%" justifyContent="center">
            You are signing
          </Heading>
          <Heading as={Flex} fontWeight="bold" size="sm">
            Message:
          </Heading>
          <Text fontSize="md" w="100%">
            link3.to wants you to sign in with your Nexus account:
            <br />
            {unsignedDataQuery.data?.data}
          </Text>
        </VStack>
        <FormControl isInvalid={!!formState.errors.password} pt="8px">
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            {...register('password', {
              validate: validatePassword,
            })}
            background="white"
            color="black"
            data-test-id="password"
          />
          <FormErrorMessage>Password Incorrect!</FormErrorMessage>
        </FormControl>

        <ButtonGroup mt="32px" size="md">
          <Button
            isLoading={formState.isSubmitting}
            onClick={() => window.close()}
            w="220px"
            color="gray.800"
            colorScheme="gray"
          >
            Reject
          </Button>

          <Button w="220px" isLoading={formState.isSubmitting} type="submit">
            Approve
          </Button>
        </ButtonGroup>
      </Flex>
    </Skeleton>
  );
};
