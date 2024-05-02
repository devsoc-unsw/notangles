import React from 'react';
import { Button, DialogActions } from '@mui/material';
import { styled } from '@mui/system';


const StyledDialogActions = styled(DialogActions)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 0px 60px 30px 0px;
`;

interface AddGroupDialogActionsProps {
  handleClose: () => void;
  handleCreateGroup: () => void;
}

const AddGroupDialogActions: React.FC<AddGroupDialogActionsProps> = ({ handleClose, handleCreateGroup }) => {
  return (
    <StyledDialogActions>
      <Button variant="text" onClick={handleClose}>
        Cancel
      </Button>
      <Button variant="contained" onClick={handleCreateGroup}>
        Create
      </Button>
    </StyledDialogActions>
  );
};

export default AddGroupDialogActions;
