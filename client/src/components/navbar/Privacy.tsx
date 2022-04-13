import React from 'react';
import styled from 'styled-components';
import { Dialog, DialogContent, DialogTitle, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { Close, Security } from '@mui/icons-material';

import PrivacyContent from './PrivacyContent';

const StyledDialogTitle = styled(DialogTitle)`
  margin: 0;
  padding: 20px;
`;

const StyledTypography = styled(Typography)`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  right: 10px;
  top: 10px;
`;

const PrivacyButton = styled(IconButton)`
  margin-right: 5px;
`;

const StyledDialogContent = styled(DialogContent)`
  padding: 20px;
`;

const StyledDialogBody = styled(Typography)`
  padding-bottom: 20px;
`;

const FooterText = styled(Typography)`
  text-align: right;
  padding-top: 20px;
`;

const Privacy: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Tooltip title="Privacy">
        <PrivacyButton color="inherit" onClick={toggleIsOpen}>
          <Security />
        </PrivacyButton>
      </Tooltip>
      <Dialog
        disableScrollLock
        onClose={toggleIsOpen}
        aria-labelledby="customized-dialog-title"
        open={isOpen}
        fullWidth
        maxWidth="sm"
      >
        <StyledDialogTitle>
          <StyledTypography variant="h5">Application privacy statement</StyledTypography>
          <CloseButton color="inherit" aria-label="close" onClick={toggleIsOpen}>
            <Close />
          </CloseButton>
        </StyledDialogTitle>
        <Divider />
        <StyledDialogContent>
          <StyledDialogBody gutterBottom variant="body2">
            This privacy statement (“Privacy Statement”) applies to the treatment of personally identifiable information submitted
            by, or otherwise obtained from, you in connection with the associated application (“Application”). The Application is
            provided by Notangles (and may be provided by Notangles on behalf of a Notangles licensor or partner (“Application
            Partner”). By using or otherwise accessing the Application, you acknowledge that you accept the practices and policies
            outlined in this Privacy Statement.
          </StyledDialogBody>
          <PrivacyContent />
          <FooterText gutterBottom variant="body2">
            Effective Date: 11<sup>th</sup> October, 2020
          </FooterText>
        </StyledDialogContent>
      </Dialog>
    </>
  );
};

export default Privacy;
