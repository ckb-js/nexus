import { radioAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(radioAnatomy.keys);

export const Radio = defineMultiStyleConfig({
  baseStyle: definePartsStyle(({ colorScheme, size }) => {
    const borderWidth = ({ lg: '6px', md: '5px' } as Record<string, string | undefined>)[size as string];
    return {
      control: {
        color: colorScheme,
        transitionProperty: 'border',
        transitionDuration: 'normal',

        boxShadow: 'none !important',
        _checked: {
          borderColor: colorScheme,
          borderWidth,
          _before: {
            width: '100%',
            height: '100%',
          },
        },
        _active: {
          _checked: {
            borderColor: colorScheme,
            borderWidth,
            _before: {
              width: '100%',
              height: '100%',
            },
          },
        },
      },
      container: {
        _disabled: {
          opacity: 0.5,
        },
      },
    };
  }),
});
