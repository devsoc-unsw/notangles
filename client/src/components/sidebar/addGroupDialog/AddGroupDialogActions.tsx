import { Button, DialogActions } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

import { Group } from './AddGroupDialog';

const StyledDialogActions = styled(DialogActions)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 0px 30px 30px 0px;
`;

interface AddGroupDialogActionsProps {
  handleClose: () => void;
  handleCreateGroup: () => void;
  group: Group;
}

const AddGroupDialogActions: React.FC<AddGroupDialogActionsProps> = ({
  handleClose,
  handleCreateGroup,
  group
}) => {
  return (
    <StyledDialogActions>
      <Button variant="text" onClick={handleClose}>
        Cancel
      </Button>
      <Button
        disabled={group.name === '' || group.members.length === 0}
        variant="contained"
        onClick={handleCreateGroup}
      >
        Create
      </Button>
    </StyledDialogActions>
  );
};

export default AddGroupDialogActions;
