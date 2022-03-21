import React from 'react';
import { Box } from '@material-ui/core';
import styled from 'styled-components';
import { contentPadding } from '../constants/theme';
import PrivacyContent from './PrivacyContent';

const ContentWrapper = styled(Box)`
  width: 75%;
  max-width: 1050px;
  margin: auto;
  padding-top: 110px; // for nav bar
  padding-left: ${contentPadding}px;
  padding-right: ${contentPadding}px;
  box-sizing: border-box;
  color: ${(props) => props.theme.palette.text.primary};
`;

const FooterText = styled.p`
  text-align: right;
  padding: 20px;
`;

const Privacy: React.FC = () => {
  return (
    <ContentWrapper>
      <h1>Application privacy statement</h1>
      <p>
        This privacy statement (“Privacy Statement”) applies to the treatment of personally identifiable information submitted by,
        or otherwise obtained from, you in connection with the associated application (“Application”). The Application is provided
        by Notangles (and may be provided by Notangles on behalf of a Notangles licensor or partner (“Application Partner”). By
        using or otherwise accessing the Application, you acknowledge that you accept the practices and policies outlined in this
        Privacy Statement.
      </p>
      <PrivacyContent />
      <FooterText>
        Effective Date: 11<sup>th</sup> October, 2020
      </FooterText>
    </ContentWrapper>
  );
};

export default Privacy;