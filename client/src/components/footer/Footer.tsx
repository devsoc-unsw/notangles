import { Box, Divider } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

import FooterLinks from './FooterLinks';
import FooterInfo from './FooterInfo';

const FooterContainer = styled(Box)`
  text-align: center;
  font-size: 12px;
  margin-bottom: 25px;
  max-width: 95%;

  & div {
    margin: 0 auto;
    line-height: 1.5;
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <Divider />
      <br />
      <br />
      <FooterInfo />
      <br />
      <br />
      <Divider />
      <br />
      <br />
      <FooterLinks />
    </FooterContainer>
  );
};

export default Footer;
