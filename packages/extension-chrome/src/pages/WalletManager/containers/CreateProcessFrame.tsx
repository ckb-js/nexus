import React, { FC, useCallback, useMemo, useState } from 'react';
import { Box, Button, Center, Flex, FlexProps, Grid, HStack, Icon, Text, useToast } from '@chakra-ui/react';
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useOutletContext as _useOutletContext,
} from 'react-router-dom';
import StepProcessingIcon from '../../Components/icons/StepProcessing.svg';
import StepWaitingIcon from '../../Components/icons/StepWaiting.svg';

import range from 'lodash.range';
import { Logo } from '../../Components/Logo';
import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { CreateFlowConfig } from '../types';
import Steps from 'rc-steps';
import { StepsProps } from 'rc-steps/lib/Steps';

const ProcessIndicator: FC<{ total: number; current: number } & FlexProps> = ({ total, current }) => {
  const getIndicatorColor = (index: number) => {
    if (index < current) {
      return 'primary.lighter';
    } else if (index > current) {
      return 'gray.300';
    }
    return 'primary';
  };
  return (
    <HStack spacing="12px" paddingY="4px" mb="48px">
      {range(0, total).map((index) => (
        <Box key={index} w="66px" h="5px" borderRadius="5px" backgroundColor={getIndicatorColor(index)} />
      ))}
    </HStack>
  );
};

const renderSingleStep: StepsProps['itemRender'] = ({ title, description, status }) => {
  const icon = {
    wait: <Icon as={StepWaitingIcon} w="24px" h="24px" />,
    process: <Icon as={StepProcessingIcon} w="24px" h="24px" />,
    finish: <CheckCircleIcon w="20px" h="20px" color="white" />,
    error: <></>,
  }[status ?? 'wait'];
  return (
    <Grid
      sx={{
        '&:last-child .rc-steps-item-tail': {
          height: 0,
          width: 0,
          border: 'none',
        },
      }}
      color="white"
      templateRows="auto"
      templateColumns="24px auto"
    >
      <Box alignSelf="center" justifySelf="center">
        {icon}
      </Box>
      <Text as={Box} ml="4px" alignSelf="center" fontWeight="semibold" fontSize="md">
        {title}
      </Text>
      <Box
        className="rc-steps-item-tail"
        w="0"
        alignSelf="center"
        justifySelf="center"
        h="43px"
        border="1px solid white"
        borderRadius="2px"
        my="1px"
      />
      <Text as={Box} lineHeight="4" ml="8px" fontSize="sm">
        {description}
      </Text>
    </Grid>
  );
};

export type OutletContext = {
  whenSubmit: (cb: () => Promise<unknown>) => void;
  setNextAvailable: (enable: boolean) => void;
};

export function useOutletContext(): OutletContext {
  return _useOutletContext() as OutletContext;
}

const NOOP = () => Promise.resolve() as Promise<unknown>;

export const CreateProcessFrame: FC = () => {
  const [nextAvailable, setNextAvailable] = useState(false);
  const currentPath = useLocation().pathname;
  const flowConfig = useLoaderData() as CreateFlowConfig;
  const flowPaths = flowConfig.steps.map((s) => s.path);
  const navigate = useNavigate();

  const currentPathIndex = useMemo(
    () => flowPaths.findIndex((path) => currentPath.endsWith(path)),
    [flowPaths, currentPath],
  );
  const currentStep = flowConfig.steps[currentPathIndex];

  const goBack = () => {
    setNextAvailable(false);
    navigate(currentPathIndex === 0 ? flowConfig.entry : flowPaths[currentPathIndex - 1], { replace: true });
  };

  const [whenFormSubmit, _setWhenFormSubmit] = useState({ action: NOOP });

  const setWhenFormSubmit = useCallback((cb: (() => Promise<unknown>) | undefined) => {
    _setWhenFormSubmit({ action: cb ?? NOOP });
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const onSubmit = async (e: React.FormEvent<unknown>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await whenFormSubmit.action();
      setNextAvailable(false);
      setWhenFormSubmit(undefined);
      navigate(currentPathIndex === flowPaths.length - 1 ? flowConfig.exit : flowPaths[currentPathIndex + 1], {
        replace: true,
      });
    } catch {
      toast({
        status: 'error',
        title: 'Something went wrong',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Flex background="gray.50" color="blackAlpha.900">
      <Flex
        w="468px"
        pb="132px"
        alignItems="center"
        pl="80px"
        position="relative"
        backgroundColor="primary.darker"
        height="100vh"
      >
        <Logo position="absolute" left="80px" top="48px" />
        <Box minH="520px">
          <Steps
            current={currentPathIndex}
            direction="vertical"
            itemRender={renderSingleStep}
            items={flowConfig.steps}
          />
        </Box>
      </Flex>
      <Flex flex={1} as="form" onSubmit={onSubmit} direction="column" justifyContent="center" alignItems="center">
        <Center flexDirection="column" flex={1}>
          <Flex alignItems="center" flexDirection="column" minH="520px">
            <Outlet context={{ whenSubmit: setWhenFormSubmit, setNextAvailable } as OutletContext} />
          </Flex>
        </Center>
        <HStack spacing="24px" mb="32px">
          {!currentStep.disableBack && (
            <Button
              data-test-id="back"
              onClick={goBack}
              colorScheme="primary"
              variant="outline"
              leftIcon={<ChevronLeftIcon />}
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            data-test-id="next"
            isLoading={submitting}
            isDisabled={!nextAvailable && !currentStep.displayOnly}
            rightIcon={!currentStep.disableBack ? <ChevronRightIcon /> : undefined}
          >
            {currentStep.nextButtonText || 'Next'}
          </Button>
        </HStack>

        <ProcessIndicator total={flowPaths.length} current={currentPathIndex} />
      </Flex>
    </Flex>
  );
};
