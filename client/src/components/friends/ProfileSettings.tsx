import React from 'react';
import styled from 'styled-components';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

const StyledDialogTitle = styled(MuiDialogTitle)`
  margin: 0;
  padding: 20px;
`;
const CloseButton = styled(IconButton)`
  position: absolute;
  right: 10px;
  top: 10px;
`;
const DialogContent = styled(MuiDialogContent)`
  padding: 20px;
`;

const ProfileSettings: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <Button size="small" color="inherit" onClick={toggleIsOpen}>
        Profile Settings
      </Button>
      <Dialog
        disableScrollLock
        onClose={toggleIsOpen}
        aria-labelledby="customized-dialog-title"
        open={isOpen}
        fullWidth
        maxWidth="sm"
      >
        <StyledDialogTitle disableTypography>
          <Typography variant="h5">Profile Settings</Typography>
          <CloseButton aria-label="close" onClick={toggleIsOpen}>
            <CloseIcon />
          </CloseButton>
        </StyledDialogTitle>

        <DialogContent dividers />
      </Dialog>
    </div>
  );
};

export default ProfileSettings;
