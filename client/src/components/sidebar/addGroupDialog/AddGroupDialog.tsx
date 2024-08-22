import { Add as AddIcon } from '@mui/icons-material';
import { Dialog, IconButton, MenuItem, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { API_URL } from '../../../api/config';
import NetworkError from '../../../interfaces/NetworkError';
import AddGroupDialogActions from './AddGroupDialogActions';
import AddGroupDialogContent from './AddGroupDialogContent';
import AddGroupDialogTitle from './AddGroupDialogTitle';

export interface MemberType {
  name: string;
  zID: string;
}

export enum Privacy {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export interface Group {
  id: string;
  name: string;
  description: string;
  visibility: Privacy;
  timetables: string[];
  members: string[];
  groupAdmins: string[];
  imageURL: string;
}

interface AddGroupDialogProps {
  groupData?: Group;
  getGroups: () => void;
  userId: string;
}

const AddGroupDialog: React.FC<AddGroupDialogProps> = ({ groupData, getGroups, userId }) => {
  const emptyGroupData: Group = {
    id: '',
    name: '',
    description: '',
    visibility: Privacy.PRIVATE,
    timetables: [],
    members: [],
    groupAdmins: [userId],
    imageURL: '',
  };

  const [isOpen, setIsOpen] = useState(false);
  const [group, setGroup] = useState<Group>(groupData || emptyGroupData);

  useEffect(() => {
    setGroup({ ...group, groupAdmins: [userId] });
  }, [userId]);

  const handleCreateGroup = async () => {
    try {
      const res = await fetch(`${API_URL.server}/group`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: group.name,
          visibility: group.visibility,
          timetableIDs: group.timetables,
          memberIDs: group.members,
          groupAdminIDs: group.groupAdmins,
          imageURL: group.imageURL,
        }),
      });
      const groupCreationStatus = await res.json();
      console.log('group creation status', groupCreationStatus.data); // Can see the status of group creation here!

      if (res.status === 201) {
        getGroups();
        handleClose();
      } else {
        throw new NetworkError("Couldn't get response");
      }
    } catch (error) {
      throw new NetworkError(`Couldn't get response cause encountered error: ${error}`);
    }
  };

  const handleEditGroup = async (groupId: string) => {
    try {
      const res = await fetch(`${API_URL.server}/group/${groupId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: group.name,
          visibility: group.visibility,
          timetables: group.timetables,
          description: group.description,
          members: group.members,
          groupAdmins: group.groupAdmins,
          imageURL: group.imageURL,
        }),
      });
      const groupCreationStatus = await res.json();
      console.log('group update status', groupCreationStatus.data); // Can see the status of group creation here!
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

  const handleClose = () => {
    setIsOpen(false);
    setGroup({
      id: '',
      name: '',
      description: '',
      visibility: Privacy.PRIVATE,
      timetables: [],
      members: [],
      groupAdmins: [userId],
      imageURL: '',
    });
  };

  return (
    <>
      {groupData ? (
        <MenuItem onClick={() => setIsOpen(true)}>Edit</MenuItem>
      ) : (
        <Tooltip title="Add a Group" placement="right">
          <IconButton color="inherit" onClick={() => setIsOpen(true)}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      )}

      <Dialog disableScrollLock onClose={handleClose} open={isOpen} fullWidth maxWidth="sm">
        <AddGroupDialogTitle isEditing={groupData !== undefined} handleClose={handleClose} />
        <AddGroupDialogContent group={group} setGroup={setGroup} />
        <AddGroupDialogActions
          isEditing={groupData !== undefined}
          group={group}
          handleClose={handleClose}
          handleCreateGroup={handleCreateGroup}
          handleEditGroup={handleEditGroup}
        />
      </Dialog>
    </>
  );
};

export default AddGroupDialog;
