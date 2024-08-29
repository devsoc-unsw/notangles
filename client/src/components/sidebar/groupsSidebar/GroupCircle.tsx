import React from 'react';
import NotanglesLogo from '../../../assets/notangles_1.png';
import { ListItemIcon, Tooltip } from '@mui/material';
import AddOrEditGroupDialog, { Group } from './AddOrEditGroupDialog';
import MenuItem from '@mui/material/MenuItem';
import { RedDeleteIcon, RedListItemText, StyledMenu } from '../../../styles/CustomEventStyles';
import { API_URL } from '../../../api/config';
import NetworkError from '../../../interfaces/NetworkError';
import { User } from './GroupsSidebar';

const GroupCircle: React.FC<{ group: Group; getGroups: () => void; user: User | undefined }> = ({
  group,
  getGroups,
  user,
}) => {
  if (!user) return <></>;

  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

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
    <div onContextMenu={handleContextMenu} style={{ cursor: 'pointer' }}>
      <Tooltip title={group.name} placement="right">
        <img
          src={group.imageURL || NotanglesLogo}
          width={40}
          height={40}
          style={{ borderRadius: 999, backgroundColor: 'white' }}
        />
      </Tooltip>
      <StyledMenu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
      >
        <AddOrEditGroupDialog onClose={editGroupDialogOnClose} user={user} editGroupData={group} />
        <MenuItem onClick={handleDeleteGroup}>
          <ListItemIcon>
            <RedDeleteIcon fontSize="small" />
          </ListItemIcon>
          <RedListItemText>Delete</RedListItemText>
        </MenuItem>
      </StyledMenu>
    </div>
  );
};

export default GroupCircle;
