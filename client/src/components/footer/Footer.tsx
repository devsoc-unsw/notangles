import React from 'react';
import { Box, Divider, Stack } from '@mui/material';
import { styled } from '@mui/system';

import FooterInfo from './FooterInfo';
import FooterLinks from './FooterLinks';

const FooterContainer = styled(Box)`
  text-align: left;
  font-size: 12px;
  max-width: 95%;
  margin: 0 0 25px 60px;

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
