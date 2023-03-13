import React, { FC } from 'react';
import { WhiteAlphaBox } from '../../../Components/WhiteAlphaBox';
import { useSigningData } from './useSigningData';

export const ViewData: FC = () => {
  const [signingData] = useSigningData();
  return (
    <WhiteAlphaBox
      fontWeight="bold"
      lineHeight="24px"
      fontSize="16px"
      overflow="auto"
      w="452px"
      p="16px 20px"
      h="538px"
      sx={{
        lineBreak: 'anywhere',
      }}
    >
      {signingData}
    </WhiteAlphaBox>
  );
};
