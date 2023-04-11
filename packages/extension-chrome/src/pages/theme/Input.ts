import { inputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { getColor } from './utils';

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(inputAnatomy.keys);

const primary = definePartsStyle(({ theme }) => ({
  field: {
    color: 'black',
    borderWidth: '1px',
    borderColor: 'gray.100',

    _hover: {
      borderColor: 'gray.300',
    },

    _invalid: {
      borderWidth: '2px',
      borderColor: `${getColor(theme, 'error.darker')} !important`,
    },
    _focusVisible: {
      borderWidth: '2px',
      borderColor: 'primary',
    },
  },
}));

const accent = definePartsStyle(({ theme }) => ({
  field: {
    color: 'black',
    borderWidth: '1px',
    borderColor: 'white.300',
    _hover: {
      borderColor: 'white.700',
    },
    _invalid: {
      borderWidth: '2px',
      borderColor: `${getColor(theme, 'error.lighter')} !important`,
    },
    _focusVisible: {
      borderWidth: '2px',
      borderColor: 'accent',
    },
  },
  element: {
    _invalid: {
      color: 'error.lighter',
    },
  },
}));

export const Input = defineMultiStyleConfig({
  baseStyle: {
    field: {
      _placeholder: {
        color: 'gray.400',
      },
      color: 'gray.900',
    },
  },
  variants: { primary, accent },
});
