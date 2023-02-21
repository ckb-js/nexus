import React, { FC } from 'react';
import LogoBase from './icons/LogoBase.svg';
import LogoFilled from './icons/LogoFilled.svg';
import { Icon, IconProps } from '@chakra-ui/react';
export type LogoProps = {
  variant?: 'filled' | 'base';
} & Omit<IconProps, 'viewBox' | 'as' | 'w' | 'h' | 'width' | 'height'>;

const iconVariantMap = {
  base: LogoBase,
  filled: LogoFilled,
} as const;

export const Logo: FC<LogoProps> = ({ variant = 'base', ...rest }) => {
  return <Icon {...rest} w="76px" h="30px" viewBox="0 0 76 30" as={iconVariantMap[variant]} />;
};
