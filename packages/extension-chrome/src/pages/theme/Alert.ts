import { alertAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, AlertProps } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(alertAnatomy.keys);

const baseStyle = definePartsStyle(({ status }) => {
  const color = {
    error: 'error',
    warning: 'warning',
    info: 'info',
    success: 'success',
    loading: 'info',
  }[status as NonNullable<AlertProps['status']>];
  return {
    container: {
      bg: `${color}.bg`,
    },
    icon: {
      color: `${color}.darker`,
    },
    title: {
      color: 'gray.900',
    },
    description: {
      color: 'gray.900',
    },
  };
});

export const Alert = defineMultiStyleConfig({
  baseStyle,
});
