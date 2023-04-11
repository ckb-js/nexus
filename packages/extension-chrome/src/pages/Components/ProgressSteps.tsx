import { CheckCircleIcon } from '@chakra-ui/icons';
import { Box, BoxProps, Grid, Icon, Text } from '@chakra-ui/react';
import Steps from 'rc-steps';
import { StepsProps } from 'rc-steps/lib/Steps';
import React, { FC } from 'react';
import StepProcessingIcon from './icons/StepProcessing.svg';
import StepWaitingIcon from './icons/StepWaiting.svg';

export type ProgressStepsProps = Pick<StepsProps, 'items' | 'current'> & BoxProps;
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
      transitionDuration="common"
      transitionProperty="opacity"
      opacity={status === 'wait' ? 0.7 : 1}
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
        transitionDuration="common"
        transitionProperty="opacity"
        opacity={status === 'finish' ? 1 : 0.7}
      />
      <Text as={Box} lineHeight="4" ml="8px" fontSize="sm">
        {description}
      </Text>
    </Grid>
  );
};

export const ProgressSteps: FC<ProgressStepsProps> = (props) => {
  return <Box as={Steps} direction="vertical" itemRender={renderSingleStep} {...props} />;
};
