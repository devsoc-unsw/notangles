import React from 'react';
import styled from 'styled-components';
import PrivacyContent from './PrivacyContent';
import IconButton from '@material-ui/core/IconButton';
import SecurityIcon from '@mui/icons-material/Security';
import CloseIcon from '@material-ui/icons/Close';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

const PrivacyButton = styled(SecurityIcon)`
  margin-right: 5px;
`;

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

const DialogContent = styled(MuiDialogContent)`
  padding: 20px;
`;

const StyledDialogBody = styled(Typography)`
  padding-bottom: 20px;
`

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
    <div>
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
    </div>
  );
};

export default Privacy;
