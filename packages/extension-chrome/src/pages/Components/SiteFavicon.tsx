import { Image, ImageProps } from '@chakra-ui/react';
import React, { FC, useMemo } from 'react';
import { useService } from '../hooks/useService';

export const SiteFavicon: FC<
  Omit<ImageProps, 'src' | 'w' | 'h' | 'width' | 'height'> & { host: string; size?: number }
> = ({ host, size = 32, ...rest }) => {
  const platformService = useService('platformService');

  const faviconURL = useMemo(() => platformService.getFavicon({ size, host }), [platformService, size, host]);

  return <Image src={faviconURL} w={`${size}px`} h={`${size}px`} {...rest} />;
};
