import { Dict } from '@chakra-ui/utils';

export function getColor(theme: Dict, color: string, defaultValue = '#000000'): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return theme.colors[color] || defaultValue;
}
