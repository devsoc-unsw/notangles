import React, { useState } from 'react';
import { Group } from '@mui/icons-material';
import { Dialog, DialogTitle, IconButton, styled, Tooltip, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import FriendsTablist from './FriendsTablist';

const StyledDialogTitle = styled(DialogTitle)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 30px 30px 0px 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const FriendsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Tooltip title="Your Friends" placement="right">
        <IconButton color="inherit" onClick={() => setIsOpen(true)}>
          <Group />
        </IconButton>
      </Tooltip>

      <Dialog disableScrollLock onClose={handleClose} open={isOpen} fullWidth maxWidth="sm">
        <>
          <StyledDialogTitle>
            <Typography variant="h6">Friends</Typography>
            <div>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </div>
          </StyledDialogTitle>
          <FriendsTablist />
        </>
      </Dialog>
    </>
  );
};

export default FriendsDialog;
