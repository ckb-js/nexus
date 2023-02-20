import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { WhiteAlphaBox } from '../../Components/WhiteAlphaBox';
import { useSessionMessenger } from '../../hooks/useSessionMessenger';

// TODO: implement
export const SignData: FC = () => {
  const sessionManager = useSessionMessenger();

  const sendSessionMutation = useMutation({
    mutationFn: async (approve: boolean) => {
      await sessionManager.send(approve ? 'session_approveSignData' : 'session_rejectSignData');
    },
  });

  const { handleSubmit, register } = useForm({
    defaultValues: { password: '' },
  });
  const onSubmit = async () => {
    await sendSessionMutation.mutateAsync(true);
    window.close();
  };

  return (
    <>
      <Heading fontSize="2xl" fontWeight="semibold" w="452px" mt="28px">
        Sign Message
      </Heading>

      <WhiteAlphaBox mt="32px" p="16px 20px">
        <Link fontSize="sm">https://link3.to</Link>
      </WhiteAlphaBox>

      <Box mt="32px" fontWeight="semibold" fontSize="md">
        Only sign this message if you fully understand the content and trust the requesting site.
      </Box>

      <Flex direction="column" as="form" onSubmit={handleSubmit(onSubmit)}>
        <VStack as={WhiteAlphaBox} mt="32px" spacing="12px" alignItems="flex-start" direction="column" p="16px 20px">
          <Heading size="sm" as={Flex} w="100%" justifyContent="center">
            You are signing
          </Heading>
          <Heading as={Flex} fontWeight="bold" size="sm">
            Message:
          </Heading>
          <Text fontSize="md" w="100%">
            link3.to wants you to sign in with your Nexus account:
            {' 0x2ea31djfakljfkadjkfjda;kfjdf29e43098903458045j'}
          </Text>
        </VStack>
        <FormControl pt="8px">
          <FormLabel>Password</FormLabel>
          <Input {...register('password')} background="white" color="black" data-test-id="password" />
        </FormControl>

        <ButtonGroup mt="32px" size="md">
          <Button
            isLoading={sendSessionMutation.isLoading}
            onClick={() => window.close()}
            w="220px"
            color="gray.800"
            colorScheme="gray"
          >
            Reject
          </Button>

          <Button w="220px" isLoading={sendSessionMutation.isLoading} type="submit">
            Approve
          </Button>
        </ButtonGroup>
      </Flex>
    </>
  );
};
