import React, { useState } from 'react';
import { Group } from '@mui/icons-material';
import { Badge, Dialog, DialogTitle, IconButton, Paper, styled, Tooltip, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import FriendsTablist from './FriendsTablist';
import { User } from '../../UserAccount';

const StyledDialogTitle = styled(DialogTitle)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 30px 30px 0px 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const StyledPaper = styled(Paper)`
  height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const FriendsDialog: React.FC<{ user: User | undefined; getUserInfo: () => void }> = ({ user, getUserInfo }) => {
  if (!user) return <></>;
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      <IconButton color="inherit" onClick={() => setIsOpen(true)}>
        <Badge color="error" variant="dot" invisible={user.incoming.length === 0}>
          <Group />
        </Badge>
      </IconButton>

      <Dialog
        PaperProps={{ component: StyledPaper }}
        disableScrollLock
        onClose={handleClose}
        open={isOpen}
        fullWidth
        maxWidth="sm"
      >
        <>
          <StyledDialogTitle>
            <Typography variant="h6">Friends</Typography>
            <div>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </div>
          </StyledDialogTitle>
          <FriendsTablist user={user} getUserInfo={getUserInfo} />
        </>
      </Dialog>
    </>
  );
};

export default FriendsDialog;
