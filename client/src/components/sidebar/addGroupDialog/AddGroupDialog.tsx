import { Add as AddIcon } from '@mui/icons-material';
import { Dialog, IconButton, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { API_URL } from '../../../api/config';
import NotanglesLogo from '../../../assets/notangles_1.png';
import NetworkError from '../../../interfaces/NetworkError';
import AddGroupDialogActions from './AddGroupDialogActions';
import AddGroupDialogContent from './AddGroupDialogContent';
import AddGroupDialogTitle from './AddGroupDialogTitle';

export interface MemberType {
  name: string;
  zID: string;
}

export enum Privacy {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

interface GroupData {
  name: string;
  visibility: Privacy;
  timetableIDs: string[];
  memberIds: string[];
  groupAdmins: string[];
  groupImageURL: string;
}

interface AddGroupDialogProps {
  getGroups: () => void;
  groupData?: GroupData;
}

export interface Group {
  id: string;
  name: string;
  visibility: Privacy;
  timetableIDs: string[];
  memberIds: string[];
  groupAdmins: string[];
  groupImageURL: string;
}

const AddGroupDialog: React.FC<AddGroupDialogProps> = ({ getGroups, groupData }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [group, setGroup] = useState<Group>({
    id: '',
    name: '',
    visibility: Privacy.PRIVATE,
    timetableIDs: [],
    memberIds: [],
    groupAdmins: [],
    groupImageURL: NotanglesLogo,
  });

  useEffect(() => {
    if (groupData) {
      setGroup({ id: '', ...groupData });
    }
  }, []);

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
          timetableIDs: group.timetableIDs,
          memberIDs: group.memberIds,
          groupAdminIDs: group.groupAdmins,
          imageURL: group.groupImageURL,
        }),
      });
      const groupCreationStatus = await res.json();
      console.log(groupCreationStatus); // Can see the status of group creation here!

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

  const handleClose = () => {
    setIsOpen(false);
    setGroup({
      id: '',
      name: '',
      visibility: Privacy.PRIVATE,
      timetableIDs: [],
      memberIds: [],
      groupAdmins: [],
      groupImageURL: NotanglesLogo,
    });
  };

  return (
    <>
      <Tooltip title={groupData ? 'Edit Group' : 'Add a Group'} placement="right">
        <IconButton color="inherit" onClick={() => setIsOpen(true)}>
          <AddIcon />
        </IconButton>
      </Tooltip>

      <Dialog disableScrollLock onClose={handleClose} open={isOpen} fullWidth maxWidth="sm">
        <AddGroupDialogTitle handleClose={handleClose} />
        <AddGroupDialogContent group={group} setGroup={setGroup} />
        <AddGroupDialogActions group={group} handleClose={handleClose} handleCreateGroup={handleCreateGroup} />
      </Dialog>
    </>
  );
};

export default AddGroupDialog;
