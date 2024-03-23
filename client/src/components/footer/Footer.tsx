import { Box, Divider, Stack } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

import FooterInfo from './FooterInfo';
import FooterLinks from './FooterLinks';

const FooterContainer = styled(Box)`
  text-align: left;
  font-size: 12px;
  margin-bottom: 25px;
  max-width: 95%;
  margin: 0 auto;

  & div Box {
    line-height: 1.5;
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <Stack spacing={4}>
        <Divider />
        <FooterInfo />
        <Divider />
        <FooterLinks />
      </Stack>
    </FooterContainer>
  );
};

export default Footer;
