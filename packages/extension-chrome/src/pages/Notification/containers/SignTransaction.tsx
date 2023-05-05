/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  Tooltip,
} from '@chakra-ui/react';
import numeral from 'numeral';
import { encodeToAddress, TransactionSkeletonObject } from '@ckb-lumos/helpers';
import { predefined } from '@ckb-lumos/config-manager';
import { useQuery } from '@tanstack/react-query';
import React, { FC, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useCheckPassword } from '../../hooks/useCheckPassword';
import { useSessionMessenger } from '../../hooks/useSessionMessenger';
import { parseCellType } from '../utils/parseCellType';
import { useConfigQuery } from '../../hooks/useConfigQuery';
import { NetworkName } from '@nexus-wallet/protocol';
import { formatUnit } from '@ckb-lumos/bi';

type TransactionIOListProps = {
  type: 'inputs' | 'outputs';
  tx: Pick<TransactionSkeletonObject, 'inputs' | 'outputs'>;
  networkName?: NetworkName;
} & TableProps;

const CellCapacity: FC<{ capacity: string }> = ({ capacity }) => {
  const amount = numeral(formatUnit(capacity, 'ckb')).format('0,0[.][00000000]');

  const [integerPart, decimalPart = ''] = amount.split('.');

  return (
    <>
      {decimalPart ? (
        <Tooltip hasArrow placement="top" label={`${amount} CKB`}>
          <Box>
            ≈{integerPart}
            {' CKB'}
          </Box>
        </Tooltip>
      ) : (
        <Box>{amount} CKB</Box>
      )}
    </>
  );
};
const TransactionIOList: FC<TransactionIOListProps> = ({ type, networkName, tx, ...rest }) => {
  // TODO: a better way to implement: use a config provider to get the config better.
  const lumosConfig = networkName === 'ckb' ? predefined.LINA : predefined.AGGRON4;

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
          const addr = encodeToAddress(cell.cellOutput.lock, { config: lumosConfig });
          return (
            <Tr h="50px" key={index} data-test-id={`transaction.${type}[${index}]`}>
              <Td p="0" data-test-id={`transaction.${type}[${index}].address`}>
                <Flex>
                  <Box w="60px" p="16px">
                    #{index + 1}
                  </Box>
                  <Tooltip hasArrow placement="top" label={addr}>
                    <Box p="16px">
                      {addr.slice(0, 5)}...{addr.slice(-4)}
                    </Box>
                  </Tooltip>
                </Flex>
              </Td>
              <Td data-test-id={`transaction.${type}[${index}].type`}>{parseCellType(cell)}</Td>
              <Td data-test-id={`transaction.${type}[${index}].capacity`}>
                <CellCapacity capacity={cell.cellOutput.capacity} />
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
  const walletConfigQuery = useConfigQuery();
  const networkName = useMemo(() => {
    if (!walletConfigQuery.data) return undefined;
    const { networks, selectedNetwork } = walletConfigQuery.data;
    const currentNetwork = networks.find((network) => network.id === selectedNetwork);
    return currentNetwork?.networkName;
  }, [walletConfigQuery.data]);

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
    window.close();
  };

  return (
    <Skeleton as={Flex} flexDirection="column" isLoaded={!!transactionQuery.data} h="100%" w="100%">
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
          overflow="auto"
          maxH="420px"
        >
          <TransactionIOList networkName={networkName} type="inputs" tx={transactionQuery.data.tx} />
          <TransactionIOList networkName={networkName} type="outputs" tx={transactionQuery.data.tx} mt="12px" />
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
            isDisabled={formState.isSubmitting}
            onClick={onReject}
            w="220px"
            colorScheme="white"
            variant="outline"
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
