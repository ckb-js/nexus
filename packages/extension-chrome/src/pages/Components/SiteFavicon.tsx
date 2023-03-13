import { Image, ImageProps } from '@chakra-ui/react';
import React, { FC, useMemo } from 'react';

export const SiteFavicon: FC<
  Omit<ImageProps, 'src' | 'w' | 'h' | 'width' | 'height'> & { host: string; size?: number }
> = ({ host, size = 32, ...rest }) => {
  const faviconURL = useMemo(() => {
    const url = new URL(chrome.runtime.getURL('/_favicon/'));
    url.searchParams.set('pageUrl', `https://${host}`);
    url.searchParams.set('size', size.toString());
    return url.toString();
  }, [host, size]);

  return <Image src={faviconURL} w={`${size}px`} h={`${size}px`} {...rest} />;
};
