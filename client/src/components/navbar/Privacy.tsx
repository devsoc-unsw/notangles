import React from 'react';
import styled from 'styled-components';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import SecurityIcon from '@material-ui/icons/Security';
import PrivacyContent from './PrivacyContent';

const StyledDialogTitle = styled(MuiDialogTitle)`
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

const DialogContent = styled(MuiDialogContent)`
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
          <SecurityIcon />
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
        <StyledDialogTitle disableTypography>
          <StyledTypography variant="h5">Application privacy statement</StyledTypography>
          <CloseButton aria-label="close" onClick={toggleIsOpen}>
            <CloseIcon />
          </CloseButton>
        </StyledDialogTitle>
        <Divider />
        <DialogContent>
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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Privacy;
