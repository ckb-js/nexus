import React, { FC, useMemo } from 'react';
import { Box, Button, Center, Flex, FlexProps, HStack } from '@chakra-ui/react';
import { Outlet, useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import range from 'lodash.range';
import { Logo } from '../../Components/Logo';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { CreateFlowRouteConfig } from '../types';
import { useWalletCreationStore } from '../store';

const ProcessIndicator: FC<{ total: number; current: number } & FlexProps> = ({ total, current }) => {
  return (
    <HStack w="320px" spacing="12px" paddingY="4px" mb="48px">
      {range(0, total).map((index) => (
        <Box
          key={index}
          w="66px"
          h="5px"
          borderRadius="5px"
          backgroundColor={index === current ? 'purple.500' : 'purple.200'}
        />
      ))}
    </HStack>
  );
};

export const CreateProcessFrame: FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { set: setStoreState, dischargeNext } = useWalletCreationStore();
  const currentPath = useLocation().pathname;
  const flowConfig = useLoaderData() as CreateFlowRouteConfig;
  const flowPaths = flowConfig.flow;
  const navigate = useNavigate();

  const currentPathIndex = useMemo(() => flowPaths.findIndex((path) => path === currentPath), [flowPaths, currentPath]);
  const isLastStep = currentPathIndex === flowPaths.length - 1;
  const goNext = () => {
    setStoreState({ dischargeNext: false });
    navigate(currentPathIndex === flowPaths.length - 1 ? flowConfig.exit : flowPaths[currentPathIndex + 1], {
      replace: true,
    });
  };

  const goBack = () => {
    setStoreState({ dischargeNext: false });
    navigate(currentPathIndex === 0 ? flowConfig.entry : flowPaths[currentPathIndex - 1], { replace: true });
  };

  return (
    <Flex>
      <Flex w="468px" position="relative" backgroundColor="purple.500" height="100vh">
        <Logo position="absolute" left="80px" top="48px" />
      </Flex>
      <Flex flex={1} direction="column" justifyContent="center" alignItems="center">
        <Center flexDirection="column" flex={1}>
          <Outlet />
        </Center>
        <HStack spacing="24px" mb="32px">
          {(!isLastStep || !flowConfig.disableBackOnExit) && (
            <Button onClick={goBack} variant="outline" leftIcon={<ChevronLeftIcon />}>
              Back
            </Button>
          )}
          <Button
            // only comment for debug
            //isDisabled={!dischargeNext}
            onClick={goNext}
            rightIcon={<ChevronRightIcon />}
          >
            Next
          </Button>
        </HStack>

        <ProcessIndicator total={flowPaths.length} current={currentPathIndex} />
      </Flex>
    </Flex>
  );
};
