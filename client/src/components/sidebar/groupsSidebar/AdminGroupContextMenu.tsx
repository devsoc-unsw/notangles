import React from 'react';
import { RedDeleteIcon, RedListItemText, StyledMenu } from '../../../styles/CustomEventStyles';
import AddOrEditGroupDialog from './AddOrEditGroupDialog';
import { ListItemIcon, MenuItem } from '@mui/material';
import { API_URL } from '../../../api/config';

const AdminGroupContextMenu = () => {
    const handleDeleteGroup = async () => {
        try {
          const res = await fetch(`${API_URL.server}/group/${group.id}`, {
            method: 'DELETE',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          });
          const groupDeleteStatus = await res.json();
          console.log('group delete status', groupDeleteStatus);
          if (res.status === 200) {
            handleClose();
            getGroups();
          } else {
            throw new NetworkError("Couldn't get response");
          }
        } catch (error) {
          throw new NetworkError(`Couldn't get response cause encountered error: ${error}`);
        }
      };
    
      const editGroupDialogOnClose = () => {
        getGroups();
        handleClose();
      };

  return (
    <StyledMenu
      open={contextMenu !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
    >
      <AddOrEditGroupDialog onClose={editGroupDialogOnClose} userId={userId} editGroupData={group} />
      <MenuItem onClick={handleDeleteGroup}>
        <ListItemIcon>
          <RedDeleteIcon fontSize="small" />
        </ListItemIcon>
        <RedListItemText>Delete</RedListItemText>
      </MenuItem>
    </StyledMenu>
  );
};

export default AdminGroupContextMenu;
