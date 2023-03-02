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
import isUtf8 from 'is-utf8';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { FC, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { WhiteAlphaBox } from '../../Components/WhiteAlphaBox';
import { useCheckPassword } from '../../hooks/useCheckPassword';
import { useSessionMessenger } from '../../hooks/useSessionMessenger';
import { bytes } from '@ckb-lumos/codec/lib';

type FormState = { password: string };
export const SignData: FC = () => {
  const sessionManager = useSessionMessenger();
  const checkPassword = useCheckPassword();

  const unsignedDataQuery = useQuery({
    queryKey: ['unsignedData', sessionManager.sessionId()],
    queryFn: () => sessionManager.send('session_getUnsignedData'),
  });

  const sendSessionMutation = useMutation({
    mutationFn: async (password: string) => {
      await sessionManager.send('session_approveSignData', { password });
    },
  });

  const { handleSubmit, register, formState, setValue } = useForm<FormState>({
    mode: 'onSubmit',

    // important, without this will take performance issue
    reValidateMode: 'onSubmit',
    defaultValues: { password: '' },
  });
  const onSubmit = async ({ password }: FormState) => {
    await sendSessionMutation.mutateAsync(password);
    window.close();
  };

  const onInvalid = useCallback(() => {
    setValue('password', '');
  }, [setValue]);

  const validatePassword = useCallback(
    (password: string) => {
      return checkPassword(password);
    },
    [checkPassword],
  );

  const dataForSigning = useMemo(() => {
    if (!unsignedDataQuery.data) return '';
    const unsigned = bytes.bytify(unsignedDataQuery.data.data);
    return isUtf8(unsigned) ? new TextDecoder('utf-8').decode(new Uint8Array(unsigned)) : bytes.hexify(unsigned);
  }, [unsignedDataQuery.data]);

  const onReject = async () => {
    await sessionManager.send('session_rejectSignData');
    window.close();
  };

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
            {unsignedDataQuery.data?.url} wants you to sign in with your Nexus account:
            <br />
            {dataForSigning}
          </Text>
        </VStack>
        <FormControl isInvalid={!!formState.errors.password} mt="12px">
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
          <Button isDisabled={formState.isSubmitting} onClick={onReject} w="220px" color="gray.800" colorScheme="gray">
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
