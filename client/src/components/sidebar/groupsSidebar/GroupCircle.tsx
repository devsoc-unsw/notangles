import React from 'react';
import NotanglesLogo from '../../../assets/notangles_1.png';
import { ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { Group } from './AddOrEditGroupDialog';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { RedDeleteIcon, RedListItemText, StyledMenu } from '../../../styles/CustomEventStyles';
import { Edit } from '@mui/icons-material';
import { API_URL } from '../../../api/config';
import NetworkError from '../../../interfaces/NetworkError';

const GroupCircle: React.FC<{ group: Group; getGroups }> = ({ group, getGroups }) => {
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
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
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
