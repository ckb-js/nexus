import { inputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(inputAnatomy.keys);

const primary = definePartsStyle(() => ({
  field: {
    // chaka-ui's getColor not work here, use css variable to workaround
    '--focus-border-color': 'primary',
    color: 'black',
    borderWidth: '2px',
    _invalid: {
      borderColor: 'error.darker',
    },
    _focusVisible: {
      borderWidth: '2px',
      borderColor: 'primary',
      boxShadow: `0 0 0 1px var(--focus-border-color)`,
    },
  },
  element: {
    _invalid: {
      color: 'error.darker',
    },
  },
}));

const accent = definePartsStyle(() => ({
  field: {
    // chaka-ui's getColor not work here, use css variable to workaround
    '--focus-border-color': 'accent',
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
      boxShadow: `0 0 0 1px var(--focus-border-color)`,
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
