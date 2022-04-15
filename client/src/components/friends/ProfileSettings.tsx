import React from 'react';

import { styled } from '@mui/system';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

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
        <StyledDialogTitle>
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
