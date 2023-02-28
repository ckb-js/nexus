import {
  Table,
  Skeleton,
  Thead,
  Th,
  Tr,
  Tbody,
  Td,
  Heading,
  TableProps,
  Input,
  Box,
  FormControl,
  FormLabel,
  ButtonGroup,
  Button,
  FormErrorMessage,
} from '@chakra-ui/react';
import { encodeToAddress, TransactionSkeletonObject } from '@ckb-lumos/helpers';
import { BI } from '@ckb-lumos/lumos';
import { useQuery } from '@tanstack/react-query';
import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { useCheckPassword } from '../../hooks/useCheckPassword';
import { useSessionMessenger } from '../../hooks/useSessionMessenger';
import { parseCellType } from '../utils/parseCellType';

const TransactionIOList: FC<
  { type: 'inputs' | 'outputs'; tx: Pick<TransactionSkeletonObject, 'inputs' | 'outputs'> } & TableProps
> = ({ type, tx, ...rest }) => {
  return (
    <Table data-test-id={`transaction.${type}`} background="white" w="100%" color="blackAlpha.900" {...rest}>
      <Thead>
        <Tr>
          {[`${type}(${tx[type].length})`, 'Type', 'Capacity'].map((head) => (
            //* due to Chakra UI limit, can not override table style via theme configuration
            <Heading textTransform="capitalize" color="blackAlpha.900" p="12px 16px" as={Th} size="xs" key={head}>
              {head}
            </Heading>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {tx[type].map((cell, index) => {
          const addr = encodeToAddress(cell.cellOutput.lock);
          return (
            <Tr key={index} data-test-id={`transaction.${type}[${index}]`}>
              <Td maxW="150px" data-test-id={`transaction.${type}[${index}].address`}>
                {addr.slice(0, 5)}...{addr.slice(-4)}
              </Td>
              <Td data-test-id={`transaction.${type}[${index}].type`}>{parseCellType(cell)}</Td>
              <Td data-test-id={`transaction.${type}[${index}].capacity`}>
                {BI.from(cell.cellOutput.capacity)
                  .div(10 ** 8)
                  .toString()}{' '}
                CKB
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

type FormState = { password: string };

export const SignTransaction: FC = () => {
  const messagener = useSessionMessenger();
  const checkPassword = useCheckPassword();
  const transactionQuery = useQuery({
    queryKey: ['transaction', messagener.sessionId()] as const,
    queryFn: async () => messagener.send('session_getUnsignedTransaction'),
  });

  const { setValue, register, handleSubmit, formState } = useForm<FormState>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      password: '',
    },
  });
  const onSubmit = async ({ password }: FormState) => {
    await messagener.send('session_approveSignTransaction', { password });
    window.close();
  };
  const onInvalid = () => {
    setValue('password', '');
  };

  const onReject = async () => {
    await messagener.send('session_rejectSignTransaction');
    window.close();
  };

  return (
    <Skeleton isLoaded={!!transactionQuery.data} w="100%">
      <Heading fontSize="2xl" fontWeight="semibold" mt="28px" mb="32px">
        Sign Transaction
      </Heading>
      {!!transactionQuery.data && (
        <Box maxH="320px" overflow="auto">
          <TransactionIOList type="inputs" tx={transactionQuery.data.tx} />
          <TransactionIOList type="outputs" tx={transactionQuery.data.tx} mt="12px" />
        </Box>
      )}
      <Box mt="12px" as="form" onSubmit={handleSubmit(onSubmit, onInvalid)} flex={1}>
        <FormControl isInvalid={!!formState.errors.password}>
          <FormLabel>Password</FormLabel>
          <Input
            color="black"
            background="white"
            type="password"
            data-test-id="password"
            {...register('password', { validate: checkPassword })}
          />
          <FormErrorMessage>Password Incorrect!</FormErrorMessage>
        </FormControl>

        <ButtonGroup mt="32px" size="md">
          <Button
            data-test-id="reject"
            isLoading={formState.isSubmitting}
            onClick={onReject}
            w="220px"
            color="gray.800"
            colorScheme="gray"
          >
            Reject
          </Button>

          <Button data-test-id="approve" w="220px" isLoading={formState.isSubmitting} type="submit">
            Approve
          </Button>
        </ButtonGroup>
      </Box>
    </Skeleton>
  );
};
