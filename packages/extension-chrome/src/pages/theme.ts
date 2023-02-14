import { extendTheme, withDefaultColorScheme } from '@chakra-ui/react';

export const theme = extendTheme(
  {
    components: {
      FormLabel: {
        baseStyle: {
          fontSize: '14px',
          height: '20px',
          fontWeight: 'normal',
          mb: '4px',
        },
      },
    },
  },
  withDefaultColorScheme({
    colorScheme: 'purple',
  }),
);
