import React from 'react';
import NotanglesLogo from '../../../assets/notangles_1.png';
import { ListItemIcon, Tooltip } from '@mui/material';
import AddOrEditGroupDialog from './AddOrEditGroupDialog';
import { Group } from '../../../interfaces/Group';
import MenuItem from '@mui/material/MenuItem';
import { RedDeleteIcon, RedListItemText, StyledMenu } from '../../../styles/CustomEventStyles';
import { API_URL } from '../../../api/config';
import NetworkError from '../../../interfaces/NetworkError';
import styled from '@emotion/styled';
import { WavingHand } from '@mui/icons-material';
import { User } from '../UserAccount';

const AdminBorder = styled('div')<{ isAdmin: boolean }>(({ isAdmin }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 999,
  width: 44,
  height: 44,
  border: isAdmin ? '2px solid gold' : '',
}));

const StyledCircle = styled('img')`
  border-radius: 999px;
  width: 40px;
  height: 40px;
  background-color: white;
`;

const AdminMenu: React.FC<{ user: User; group: Group; getGroups: () => void; handleClose: () => void }> = ({
  user,
  group,
  getGroups,
  handleClose,
}) => {
  const editGroupDialogOnClose = () => {
    getGroups();
    handleClose();
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
    <>
      <AddOrEditGroupDialog onClose={editGroupDialogOnClose} user={user} editGroupData={group} />
      <MenuItem onClick={handleDeleteGroup}>
        <ListItemIcon>
          <RedDeleteIcon fontSize="small" />
        </ListItemIcon>
        <RedListItemText>Delete</RedListItemText>
      </MenuItem>
    </>
  );
};

const MemberMenu: React.FC<{ userID: string; group: Group; getGroups: () => void }> = ({
  userID,
  group,
  getGroups,
}) => {
  const handleLeaveGroup = async () => {
    try {
      const res = await fetch(`${API_URL.server}/group/${group.id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: group.name,
          description: group.description,
          visibility: group.visibility,
          timetableIDs: group.timetableIDs,
          memberIDs: group.memberIDs.filter((id) => id !== userID),
          groupAdminIDs: group.groupAdminIDs,
          imageURL: group.imageURL,
        }),
      });
      const leaveGroupStatus = await res.json();
      console.log('leave group status', leaveGroupStatus.data);
      if (res.status === 200) {
        getGroups();
      } else {
        throw new NetworkError("Couldn't get response");
      }
    } catch (error) {
      throw new NetworkError(`Couldn't get response cause encountered error: ${error}`);
    }
  };

  return (
    <MenuItem onClick={handleLeaveGroup}>
      <ListItemIcon>
        <WavingHand fontSize="small" style={{ color: 'red' }} />
      </ListItemIcon>
      <RedListItemText>Leave Group</RedListItemText>
    </MenuItem>
  );
};

const GroupCircle: React.FC<{ group: Group; getGroups: () => void; user: User | undefined }> = ({
  group,
  getGroups,
  user,
}) => {
  if (!user) return <></>;
  const isAdmin = group.groupAdminIDs.includes(user.userID);

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

  const handleClose = () => setContextMenu(null);

  return (
    <div onContextMenu={handleContextMenu} style={{ cursor: 'pointer' }}>
      <Tooltip title={group.name} placement="right">
        <AdminBorder isAdmin={isAdmin}>
          <StyledCircle src={group.imageURL || NotanglesLogo} />
        </AdminBorder>
      </Tooltip>
      <StyledMenu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined}
      >
        {isAdmin ? (
          <AdminMenu user={user} group={group} getGroups={getGroups} handleClose={handleClose} />
        ) : (
          <MemberMenu userID={user.userID} group={group} getGroups={getGroups} />
        )}
      </StyledMenu>
    </div>
  );
};

export default GroupCircle;
