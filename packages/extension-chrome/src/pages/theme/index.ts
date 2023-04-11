import { extendTheme, withDefaultColorScheme, withDefaultVariant } from '@chakra-ui/react';
import { Alert } from './Alert';
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

      white: 'rgba(255, 255, 255, 1)',
      'white.900': 'rgba(255, 255, 255, 0.92)',
      'white.800': 'rgba(255, 255, 255, 0.80)',
      'white.700': 'rgba(255, 255, 255, 0.64)',
      'white.600': 'rgba(255, 255, 255, 0.48)',
      'white.500': 'rgba(255, 255, 255, 0.36)',
      'white.400': 'rgba(255, 255, 255, 0.24)',
      'white.300': 'rgba(255, 255, 255, 0.16)',
      'white.200': 'rgba(255, 255, 255, 0.08)',
      'white.100': 'rgba(255, 255, 255, 0.06)',

      'gray.900': '#171923',
      'gray.800': '#1A202C',
      'gray.700': '#2D3748',
      'gray.600': '#4A5568',
      'gray.500': '#718096',
      'gray.400': '#A0AEC0',
      'gray.300': '#CBD5E0',
      'gray.200': '#E2E8F0',
      'gray.100': '#EDF2F7',
      'gray.50': '#F7FAFC',
    },
    symantecTokens: {
      'transaction.normal': 'var(--chakra-transition-property-normal) var(--chakra-transition-duration-normal)',
    },
  },
  {
    components: {
      Button: Button,
      Radio: Radio,
      FormLabel: FormLabel,
      Input: Input,
      Alert: Alert,
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
