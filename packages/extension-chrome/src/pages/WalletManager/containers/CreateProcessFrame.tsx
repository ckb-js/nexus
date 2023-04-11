import React, { FC, useCallback, useMemo, useState } from 'react';
import { Button, Center, Flex, HStack, useToast } from '@chakra-ui/react';
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useOutletContext as _useOutletContext,
} from 'react-router-dom';

import { Logo } from '../../Components/Logo';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { CreateFlowConfig } from '../types';
import { ProcessIndicator } from '../../Components/ProgressLine';
import { ProgressSteps } from '../../Components/ProgressSteps';

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
        <ProgressSteps minH="520px" current={currentPathIndex} items={flowConfig.steps} />
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
