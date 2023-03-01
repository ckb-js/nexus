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
  Flex,
  Spacer,
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
  const headers = [
    {
      title: `${type}(${tx[type].length})`,
      width: '188px',
    },
    {
      title: 'Type',
      width: '128px',
    },
    {
      title: 'Capacity',
      width: '128px',
    },
  ];

  return (
    <Table
      borderRadius="8px"
      data-test-id={`transaction.${type}`}
      background="white"
      w="100%"
      color="blackAlpha.900"
      colorScheme="gray"
      sx={{
        'td, th': {
          borderColor: 'gray.300',
        },
        'tr:last-child td': {
          borderBottom: 0,
        },
      }}
      {...rest}
    >
      <Thead>
        <Tr>
          {headers.map(({ title, width }) => (
            //* due to Chakra UI limit, can not override table style via theme configuration
            <Heading
              textTransform="capitalize"
              w={width}
              color="blackAlpha.900"
              p="12px 16px"
              as={Th}
              size="xs"
              key={title}
            >
              {title}
            </Heading>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {tx[type].map((cell, index) => {
          const addr = encodeToAddress(cell.cellOutput.lock);
          return (
            <Tr h="50px" key={index} data-test-id={`transaction.${type}[${index}]`}>
              <Td p="0" data-test-id={`transaction.${type}[${index}].address`}>
                <Flex>
                  <Box w="60px" p="16px">
                    #{index + 1}
                  </Box>
                  <Box p="16px">
                    {addr.slice(0, 5)}...{addr.slice(-4)}
                  </Box>
                </Flex>
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
  const messenger = useSessionMessenger();
  const checkPassword = useCheckPassword();
  const transactionQuery = useQuery({
    queryKey: ['transaction', messenger.sessionId()] as const,
    queryFn: async () => messenger.send('session_getUnsignedTransaction'),
  });

  const { setValue, register, handleSubmit, formState } = useForm<FormState>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      password: '',
    },
  });
  const onSubmit = async ({ password }: FormState) => {
    await messenger.send('session_approveSignTransaction', { password });
    window.close();
  };
  const onInvalid = () => {
    setValue('password', '');
  };

  const onReject = async () => {
    await messenger.send('session_rejectSignTransaction');
    window.close();
  };

  return (
    <Skeleton as={Flex} flexDirection="column" isLoaded={!!transactionQuery.data} h="100%" w="100%">
      <Heading fontSize="2xl" fontWeight="semibold" mt="28px" mb="32px">
        Sign Transaction
      </Heading>
      {!!transactionQuery.data && (
        <Box
          sx={{
            '::-webkit-scrollbar': {
              backgroundColor: 'transparent',
              width: '4px',
            },
            '::-webkit-scrollbar-thumb': {
              transform: 'translateX(8px)',
              borderRadius: '30px',
              backgroundColor: 'purple.500',
            },
          }}
          borderRadius="8px"
          mx="-4px"
          px="4px"
          maxH="412px"
          overflow="auto"
        >
          <TransactionIOList type="inputs" tx={transactionQuery.data.tx} />
          <TransactionIOList type="outputs" tx={transactionQuery.data.tx} mt="12px" />
        </Box>
      )}
      <Spacer />
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
