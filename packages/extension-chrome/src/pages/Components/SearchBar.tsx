import { SearchIcon } from '@chakra-ui/icons';
import { Center, Input, InputGroup, InputGroupProps, InputLeftElement, InputProps } from '@chakra-ui/react';
import React, { FC } from 'react';

type InputPickedFields = 'onChange' | 'onBlur' | 'onFocus' | 'onClick' | 'value' | 'defaultValue';

type SearchBarProps = Omit<InputGroupProps, InputPickedFields> & Pick<InputProps, InputPickedFields>;

export const SearchBar: FC<SearchBarProps> = ({ onChange, onBlur, onFocus, onClick, value, defaultValue, ...rest }) => (
  <InputGroup w="100%" {...rest}>
    <InputLeftElement h="100%" px="8px" w="60px">
      <Center w="40px" h="40px" bg="white.300" borderRadius="8px">
        <SearchIcon w="24px" h="24px" />
      </Center>
    </InputLeftElement>
    <Input
      h="60px"
      fontSize="16px"
      type="search"
      background="transparent"
      border="1px solid"
      borderColor="white.300"
      color="white"
      pl="60px"
      lineHeight="24px"
      _hover={{ borderColor: 'white.700' }}
      _focusVisible={{ borderColor: 'accent', borderWidth: '2px !important' }}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      onClick={onClick}
      value={value}
      defaultValue={defaultValue}
    />
  </InputGroup>
);
