import { ArrowBackIcon } from '@chakra-ui/icons';
import { Box, Flex } from '@chakra-ui/react';
import React, { FC, useMemo } from 'react';
import { matchPath, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

type RouteMetaConfig = {
  path: string;
  title?: string;
  allowBack?: boolean;
};

type DialogFrameProps = {
  meta: RouteMetaConfig[];
};

export const DialogFrame: FC<DialogFrameProps> = ({ meta }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const metaConfig = useMemo(() => {
    return meta.find((item) => matchPath(item.path, pathname));
  }, [meta, pathname]);
  const allowBack = !!metaConfig?.allowBack;
  const title = metaConfig?.title;

  const goBack = () => {
    navigate(-1);
  };

  return (
    <Flex w="100vw" justifyContent="center" backgroundColor="primary.darker">
      <Flex
        alignItems="center"
        direction="column"
        position="relative"
        maxW="500px"
        pt={title ? '28px' : '44px'}
        h="100vh"
        px="24px"
        pb="72px"
        color="white"
      >
        {(title || allowBack) && (
          <Flex mb="32px" alignItems="center" w="100%">
            {allowBack && (
              <ArrowBackIcon data-test-id="back" onClick={goBack} mr="12px" cursor="pointer" w="24px" h="24px" />
            )}
            {title && (
              <Box height="32px" fontSize="2xl" fontWeight="semibold">
                {title}
              </Box>
            )}
          </Flex>
        )}
        <Logo position="absolute" left="24px" bottom="20px" />
        <Outlet />
      </Flex>
    </Flex>
  );
};
