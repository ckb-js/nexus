import {
  Heading,
  Alert,
  AlertTitle,
  AlertDescription,
  AlertIcon,
  Box,
  Textarea,
  useClipboard,
  Icon,
  Flex,
  Text,
  useToast,
  Center,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { FC } from 'react';
import { hd } from '@ckb-lumos/lumos';
import { CircleMarker } from '../../Components/CircleMarker';
import FileCopyIcon from '../../Components/icons/FileCopy.svg';

import { useWalletCreationStore } from '../store';

export const CreateMnemonic: FC = () => {
  const toast = useToast();
  const setWalletStore = useWalletCreationStore((actions) => actions.set);
  const [mnemonic] = useState(() => hd.mnemonic.generateMnemonic().split(' '));

  const clipboard = useClipboard('');
  const onCopy = () => {
    clipboard.onCopy();
    toast({
      title: 'Seed Copied',
      status: 'success',
      position: 'top',
    });
  };

  useEffect(() => {
    if (mnemonic) {
      clipboard.setValue(mnemonic.join(' '));
      setWalletStore({ seed: mnemonic });
    }
  }, [mnemonic, clipboard, setWalletStore]);

  return (
    <Center flexDir="column" w="532px">
      <Heading mb="48px" lineHeight="111%" fontWeight="semibold">
        Generate Wallet Seed
      </Heading>
      <Alert status="warning" mb="12px">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="md">Warning</AlertTitle>
          <AlertDescription fontSize="md">
            Never disclose your Seed. Anyone with this Seed can take your CKB forever.
          </AlertDescription>
        </Box>
      </Alert>
      <Textarea as={Box} data-test-id="seed" resize="none" mb="12px" h="80px">
        {mnemonic?.join(' ')}
      </Textarea>
      <Flex
        data-test-id="copyToClipboard"
        type="button"
        onClick={onCopy}
        mb="48px"
        as="button"
        w="100%"
        direction="row"
        fontSize="sm"
        alignItems="center"
      >
        <Icon mr="12px" w="24px" h="24px" viewBox="0 0 27 31" as={FileCopyIcon} />
        <Box textDecoration="underline" h="20px">
          Copy to clipboard
        </Box>
      </Flex>

      <List>
        <ListItem display="flex">
          <ListIcon as={CircleMarker} w="20px" h="20px" />
          <Box w="100%" fontSize="16px" lineHeight="24px">
            <Text>Store this Seed in a password manager like 1Password.</Text>
            <Text mt="16px">
              Please write this Seed on a piece of paper and store in a secure location. If you want even stronger
              security, write it down on multiple pieces of paper and store them in at least 2-3 different locations.
            </Text>
          </Box>
        </ListItem>
      </List>
      {/* <Flex>
        <ListMarker />
        <Text w="100%" fontSize="md" mt="-2px">
          Store this Seed in a password manager like 1Password.
          <br />
          <br />
          Please write this Seed on a piece of paper and store in a secure location. If you want even stronger security,
          write it down on multiple pieces of paper and store them in at least 2-3 different locations.
        </Text>
      </Flex> */}
    </Center>
  );
};
