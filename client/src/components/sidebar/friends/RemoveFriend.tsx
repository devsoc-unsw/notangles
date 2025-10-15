import { Alert, Button, Dialog, Popover, Snackbar, Typography } from '@mui/material';
import { margin, minHeight, styled } from '@mui/system';
import { min } from 'date-fns';
import { useState } from 'react';

export const emptyProfile = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

const RemoveFriendDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    minWidth: '450px',
    minHeight: '250px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const StyledContainer = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: 25px;
  gap: 15px;
`;

const StyledButtonContainer = styled('div')`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 20px;
  justify-content: center;
  align-items: center;
`;

const CancelRemove = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.grey[300],
  color: theme.palette.text.primary,
  width: '50%',
  height: '40px',
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: theme.palette.grey[400],
  },
}));

const ConfirmRemove = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
  width: '50%',
  height: '40px',
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: theme.palette.error.main,
  },
}));

const StyledDialogTitle = styled(Typography)`
  font-weight: 600;
  font-size: 1.2rem;
`;

const StyledDialogText = styled(Typography)`
  font-size: 1.2rem;
  color: gray;
  text-align: left;
`;

interface RemoveFriendProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  firstName: string;
  profileURL?: string;
}

const RemoveFriend = ({ anchorEl, open, onClose, firstName, profileURL }: RemoveFriendProps) => {
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
      <RemoveFriendDialog open={openDialog} onClose={handleDialogClose}>
        <StyledContainer>
          <StyledDialogTitle>Remove {firstName}?</StyledDialogTitle>
          <StyledDialogText>Are you sure you want to remove {firstName} from your friends?</StyledDialogText>

          {/* <img
          src={profileURL ?? emptyProfile}
          width={34}
          height={34}
          style={{ borderRadius: 999, backgroundColor: 'white' }}
        /> */}
          <StyledButtonContainer>
            <CancelRemove onClick={handleDialogClose}> Cancel </CancelRemove>
            <ConfirmRemove onClick={handleConfirmRemove}>Confirm</ConfirmRemove>
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

      <Snackbar
        open={showBanner}
        autoHideDuration={3000}
        onClose={handleBannerClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert variant="filled" severity="success" sx={{ width: '100%' }} onClose={handleBannerClose}>
          Removed friend from friendlist
        </Alert>
      </Snackbar>
    </>
  );
};
export default RemoveFriend;
