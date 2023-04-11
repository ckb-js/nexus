import { inputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { getColor } from '@chakra-ui/theme-tools';

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
      borderColor: `${getColor(theme, 'error.darker')} !important`,
      boxShadow: 'none !important',
    },
    _focusVisible: {
      borderWidth: '2px',
      borderColor: 'primary',
      boxShadow: `0 0 0 1px ${getColor(theme, 'primary')}`,
    },
  },
  element: {
    _invalid: {
      color: 'error.darker',
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
      borderColor: `${getColor(theme, 'error.lighter')} !important`,
      boxShadow: 'none !important',
    },
    _focusVisible: {
      borderWidth: '2px',
      borderColor: 'accent',
      boxShadow: `0 0 0 1px ${getColor(theme, 'accent')}`,
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
