import { inputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { getColor } from '@chakra-ui/theme-tools';

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(inputAnatomy.keys);

const primary = definePartsStyle(({ theme }) => ({
  field: {
    color: 'black',
    borderWidth: '2px',
    _invalid: {
      borderColor: 'error.darker',
    },
    _focusVisible: {
      borderWidth: '2px',
      borderColor: 'primary',
      boxShadow: `0 0 0 1px ${getColor(theme, 'primary')}`,
      _invalid: {
        borderColor: 'error.darker',
        boxShadow: 'none',
      },
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
    borderWidth: '2px',
    _invalid: {
      borderColor: 'error.lighter',
      _focus: {
        borderColor: 'error.lighter',
      },
    },
    _focusVisible: {
      borderWidth: '2px',
      borderColor: 'accent',
      boxShadow: `0 0 0 1px ${getColor(theme, 'accent')}`,

      _invalid: {
        borderColor: 'error.lighter',
        boxShadow: 'none',
      },
    },
  },
  element: {
    _invalid: {
      color: 'error.lighter',
    },
  },
}));

export const Input = defineMultiStyleConfig({
  variants: { primary, accent },
});
