import { extendTheme, withDefaultColorScheme, withDefaultVariant } from '@chakra-ui/react';
import { Button } from './Button';
import { FormLabel } from './FormLabel';
import { Input } from './Input';
import { Radio } from './Radio';

export const theme = extendTheme(
  {
    colors: {
      accent: '#FFC255',

      'accent.hover': '#ECB451',
      'accent.active': '#C79949',
      'accent.lighter': '#FFD285',

      primary: '#805AD5',

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
  {
    components: {
      Button: Button,
      Radio: Radio,
      FormLabel: FormLabel,
      Input: Input,
    },
  },
  withDefaultColorScheme({
    components: ['Button', 'Radio', 'Input'],
    colorScheme: 'primary',
  }),
  withDefaultVariant({
    components: ['Button', 'Radio', 'Input'],
    variant: 'primary',
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
    components: ['Button', 'Radio', 'Input'],
  }),
);
