import { Alert, Button, Dialog, Popover, Snackbar, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useState } from 'react';
import UserProfilePicture from './UserProfilePicture';

const RemoveFriendDialog = styled(Dialog)<{ isMobile: boolean }>(({ theme, isMobile }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: isMobile ? '100%' : '30%',
  },
}));

const StyledContainer = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: 25px;
  gap: 10px;
`;

const StyledButtonContainer = styled('div')`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 20px;
  justify-content: center;
  align-items: center;
`;

const DialogButtonBase = styled(Button)`
  width: 50%;
  text-transform: none;
  font-weight: 500;
`;

const CancelRemove = styled(DialogButtonBase)(({ theme }) => ({
  backgroundColor: theme.palette.grey[300],
  color: theme.palette.text.primary,

  '&:hover': {
    backgroundColor: theme.palette.grey[400],
  },
}));

const ConfirmRemove = styled(DialogButtonBase)(({ theme }) => ({
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.error.main,
  },
}));

const StyledDialogTitle = styled(Typography)`
  font-weight: 600;
  font-size: 1.1rem;
`;

const StyledDialogText = styled(Typography)`
  color: gray;
  text-align: left;
`;

interface RemoveFriendProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  firstName: string;
  lastName: string;
  profileURL?: string;
}

const RemoveFriend = ({ anchorEl, open, onClose, firstName, lastName, profileURL }: RemoveFriendProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleConfirmRemove = () => {
    setOpenDialog(false);
    setShowBanner(true);
  };

  const handleBannerClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setShowBanner(false);
  };

  return (
    <>
      <RemoveFriendDialog open={openDialog} onClose={handleDialogClose} isMobile={false}>
        <StyledContainer>
          <UserProfilePicture profileURL={profileURL} size={52} alt={`${firstName} ${lastName}`} />
          <StyledDialogTitle>
            Remove {firstName} {lastName}?
          </StyledDialogTitle>
          <StyledDialogText>Are you sure you want to remove {firstName} from your friends?</StyledDialogText>
          <StyledButtonContainer>
            <CancelRemove onClick={handleDialogClose}>Cancel</CancelRemove>
            <ConfirmRemove onClick={handleConfirmRemove}>Remove Friend</ConfirmRemove>
          </StyledButtonContainer>
        </StyledContainer>
      </RemoveFriendDialog>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        sx={{ ml: '-10px' }}
      >
        <Button
          color="error"
          fullWidth
          onClick={() => {
            setOpenDialog(true);
            onClose();
          }}
          sx={{ textTransform: 'none' }}
        >
          Remove Friend
        </Button>
      </Popover>

      <Snackbar open={showBanner} autoHideDuration={3000} onClose={handleBannerClose}>
        <Alert variant="filled" severity="success" sx={{ width: '100%' }} onClose={handleBannerClose}>
          Removed friend from friends list
        </Alert>
      </Snackbar>
    </>
  );
};
export default RemoveFriend;
