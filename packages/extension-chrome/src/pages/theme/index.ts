import { extendTheme, withDefaultColorScheme, withDefaultVariant } from '@chakra-ui/react';
import { Button } from './Button';
import { FormLabel } from './FormLabel';
import { Input } from './Input';
import { Radio } from './Radio';

export const theme = extendTheme(
  {
    semanticTokens: {
      colors: {
        accent: '#FFC255',
        'accent.100': '#FFC255',
        'accent.200': '#FFC255',
        'accent.300': '#FFC255',
        'accent.400': '#FFC255',
        'accent.500': '#FFC255',
        'accent.600': '#FFC255',
        'accent.700': '#FFC255',
        'accent.800': '#FFC255',
        'accent.900': '#FFC255',

        'accent.hover': '#ECB451',
        'accent.active': '#C79949',
        'accent.lighter': '#FFD285',

        primary: '#805AD5',
        'primary.100': '#805AD5',
        'primary.200': '#805AD5',
        'primary.300': '#805AD5',
        'primary.400': '#805AD5',
        'primary.500': '#805AD5',
        'primary.600': '#805AD5',
        'primary.700': '#805AD5',
        'primary.800': '#805AD5',
        'primary.900': '#805AD5',

        'primary.hover': '#8A67D8',
        'primary.active': '#9E82DF',
        'primary.lighter': '#B794F4',
        'primary.darker': '#553C9A',

        'info.darker': '#718096',
        'info.lighter': '#63B3ED',
        'info.bg': '#BEE3F8',

        'warning.darker': '#DD6B20',
        'warning.lighter': '#F6AD55',
        'warning.bg': '#FEEBCB',

        'error.darker': '#E53E3E',
        'error.lighter': '#FC8181',
        'error.bg': '#FED7D7',

        'success.darker': '#38A169',
        'success.lighter': '#68D391',
        'success.bg': '#C6F6D5',
      },
    },
  },
  {
    components: {
      Button: Button,
      Radio: Radio,
      FormLabel: FormLabel,
      Input: Input,
    },
  },
  withDefaultColorScheme({
    colorScheme: 'primary',
  }),
);

export const solidBackgroundTheme = extendTheme(
  theme,
  withDefaultColorScheme({
    colorScheme: 'accent',
    components: ['Radio'],
  }),
  withDefaultVariant({
    variant: 'accent',
  }),
);
