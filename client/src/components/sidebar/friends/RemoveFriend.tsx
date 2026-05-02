import { Button, Dialog, Popover, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useRemoveFriend } from '../../../api/friendship/mutations';
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
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  onRemoveSuccess: () => void;
}

const RemoveFriend = ({
  anchorEl,
  open,
  onClose,
  id,
  firstName,
  lastName,
  profilePictureUrl,
  onRemoveSuccess,
}: RemoveFriendProps) => {
  const [openDialog, setOpenDialog] = useState(false);

  const queryClient = useQueryClient();
  const removeFriend = useRemoveFriend(queryClient);

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleConfirmRemove = () => {
    setOpenDialog(false);
    removeFriend.mutate(id, { onSuccess: onRemoveSuccess });
  };

  return (
    <>
      <RemoveFriendDialog open={openDialog} onClose={handleDialogClose} isMobile={false}>
        <StyledContainer>
          <UserProfilePicture profilePictureUrl={profilePictureUrl} size={52} alt={`${firstName} ${lastName}`} />
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
    </>
  );
};
export default RemoveFriend;
