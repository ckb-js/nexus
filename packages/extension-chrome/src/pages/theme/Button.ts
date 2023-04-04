import { defineStyle, defineStyleConfig } from '@chakra-ui/react';
import { transparentize } from '@chakra-ui/theme-tools';

const accent = defineStyle({
  bg: 'accent',
  color: 'black',
  _hover: {
    bg: 'accent.hover',
    _disabled: { bg: 'accent' },
  },
  _active: {
    backgroundColor: 'accent.active',
    _disabled: { bg: 'accent' },
  },
});

const primary = defineStyle({
  backgroundColor: 'primary',
  color: 'white',
  _hover: {
    backgroundColor: 'primary.hover',
    _disabled: { bg: 'primary' },
  },
  _active: {
    backgroundColor: 'primary.active',
    _disabled: { bg: 'primary' },
  },
});

const outline = defineStyle(({ colorScheme, theme }) => {
  return {
    color: colorScheme,
    borderColor: colorScheme,
    _hover: {
      bg: transparentize(colorScheme, 0.08)(theme),
      _disabled: { bg: 'transparent' },
    },
    _active: {
      bg: transparentize(colorScheme, 0.16)(theme),
      _disabled: { bg: 'transparent' },
    },
  };
});

export const Button = defineStyleConfig({
  baseStyle: {
    _disabled: {
      opacity: 0.5,
    },
  },
  variants: {
    outline,
    primary,
    accent,
  },
});
