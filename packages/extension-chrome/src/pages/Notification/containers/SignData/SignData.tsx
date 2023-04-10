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
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react';
import isUtf8 from 'is-utf8';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { WhiteAlphaBox } from '../../../Components/WhiteAlphaBox';
import { useCheckPassword } from '../../../hooks/useCheckPassword';
import { useSessionMessenger } from '../../../hooks/useSessionMessenger';
import { bytes } from '@ckb-lumos/codec/lib';
import { useSigningData } from './useSigningData';
import { Link as RouteLink } from 'react-router-dom';

type FormState = { password: string };

export const SignData: FC = () => {
  const sessionManager = useSessionMessenger();
  const checkPassword = useCheckPassword();
  const [, setSharedSigningData] = useSigningData();

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

  useEffect(() => {
    dataForSigning && setSharedSigningData(dataForSigning);
  }, [setSharedSigningData, dataForSigning]);

  const onReject = async () => {
    window.close();
  };

  const requesterHost = useMemo(() => {
    if (!unsignedDataQuery.data) return '';
    const url = new URL(unsignedDataQuery.data.url);
    return `${url.protocol}//${url.host}`;
  }, [unsignedDataQuery.data]);

  return (
    <Skeleton display="flex" flexDir="column" h="100%" isLoaded={!!unsignedDataQuery.data}>
      <WhiteAlphaBox p="16px 20px">
        <Link fontSize="sm">{requesterHost}</Link>
      </WhiteAlphaBox>

      <Box mt="32px" fontWeight="semibold" fontSize="md">
        Only sign this message if you fully understand the content and trust the requesting site.
      </Box>

      <Flex flex="1" direction="column" as="form" onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <VStack as={WhiteAlphaBox} mt="32px" spacing="12px" alignItems="flex-start" direction="column" p="32px 20px">
          <Heading size="sm" as={Flex} w="100%" justifyContent="center">
            You are signing
          </Heading>
          <Heading as={Flex} fontWeight="bold" size="sm">
            Message:
          </Heading>
          <Text fontSize="md" w="100%">
            {unsignedDataQuery.data?.url} wants you to sign in with your Nexus account:
            <br />
            <Flex
              maxW="100%"
              overflow="hidden"
              whiteSpace="nowrap"
              color="accent"
              as={RouteLink}
              to="/sign-transaction/view-data"
              cursor="pointer"
              lineHeight="24px"
              fontSize="md"
              fontWeight="bold"
              textDecorationLine="underline"
            >
              <Box whiteSpace="nowrap" maxW="50%" textOverflow="ellipsis" overflow="hidden">
                {dataForSigning.slice(0, dataForSigning.length - 19)}
              </Box>
              <Box whiteSpace="nowrap" overflow="hidden">
                {dataForSigning.slice(dataForSigning.length - 19, dataForSigning.length)}
              </Box>
            </Flex>
          </Text>
        </VStack>
        <Spacer />
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
          <Button
            isDisabled={formState.isSubmitting}
            onClick={onReject}
            w="220px"
            colorScheme="white"
            variant="outline"
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
