import styled from '@emotion/styled';
import { WavingHand } from '@mui/icons-material';
import { ListItemIcon, Tooltip } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';

import { API_URL } from '../../../api/config';
import NotanglesLogo from '../../../assets/notangles_1.png';
import { Group } from '../../../interfaces/Group';
import NetworkError from '../../../interfaces/NetworkError';
import { RedDeleteIcon, RedListItemText, StyledMenu } from '../../../styles/CustomEventStyles';
import { User } from '../UserAccount';
import AddOrEditGroupDialog from './AddOrEditGroupDialog';

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

const AdminMenu: React.FC<{
  user: User;
  group: Group;
  fetchUserInfo: (userID: string) => void;
  handleClose: () => void;
}> = ({ user, group, fetchUserInfo, handleClose }) => {
  const editGroupDialogOnClose = () => {
    fetchUserInfo(user.userID);
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
        fetchUserInfo(user.userID);
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

const MemberMenu: React.FC<{ userID: string; group: Group; fetchUserInfo: (userID: string) => void }> = ({
  userID,
  group,
  fetchUserInfo,
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
        fetchUserInfo(userID);
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

const GroupCircle: React.FC<{ group: Group; fetchUserInfo: (userID: string) => void; user: User }> = ({
  group,
  fetchUserInfo,
  user,
}) => {
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
          <AdminMenu user={user} group={group} fetchUserInfo={fetchUserInfo} handleClose={handleClose} />
        ) : (
          <MemberMenu userID={user.userID} group={group} fetchUserInfo={fetchUserInfo} />
        )}
      </StyledMenu>
    </div>
  );
};

export default GroupCircle;
