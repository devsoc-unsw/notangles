import { Button, DialogActions } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

import { Group } from './AddGroupDialog';

const StyledDialogActions = styled(DialogActions)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 0px 30px 30px 0px;
`;

interface AddGroupDialogActionsProps {
  isEditing: boolean;
  handleClose: () => void;
  handleCreateGroup: () => void;
  handleEditGroup: (groupId: string) => void;
  group: Group;
}

const AddGroupDialogActions: React.FC<AddGroupDialogActionsProps> = ({
  isEditing,
  handleClose,
  handleCreateGroup,
  handleEditGroup,
  group,
}) => {
  const isButtonDisabled = group.name === '' || group.members.length === 0;
  return (
    <StyledDialogActions>
      <Button variant="text" onClick={handleClose}>
        Cancel
      </Button>
      {isEditing ? (
        <Button disabled={isButtonDisabled} variant="contained" onClick={() => handleEditGroup(group.id)}>
          Save Changes
        </Button>
      ) : (
        <Button disabled={isButtonDisabled} variant="contained" onClick={handleCreateGroup}>
          Create
        </Button>
      )}
    </StyledDialogActions>
  );
};

export default AddGroupDialogActions;
