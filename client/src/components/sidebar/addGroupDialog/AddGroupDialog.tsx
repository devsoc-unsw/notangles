import React, { useState } from 'react';
import { Add as AddIcon } from '@mui/icons-material';
import { Dialog, IconButton, Tooltip } from '@mui/material';
import AddGroupDialogActions from './AddGroupDialogActions';
import AddGroupDialogTitle from './AddGroupDialogTitle';
import AddGroupDialogContent from './AddGroupDialogContent';
import NetworkError from '../../../interfaces/NetworkError';
import { API_URL } from '../../../api/config';
import NotanglesLogo from '../../../assets/notangles_1.png';

export interface MemberType {
  name: string;
  zID: string;
}

export enum Privacy {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

interface AddGroupDialogProps {
  getGroups: () => void;
}

export interface Group {
  name: string;
  members: MemberType[];
  imageURL: string;
  privacy: Privacy;
}

const AddGroupDialog: React.FC<AddGroupDialogProps> = ({ getGroups }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [group, setGroup] = useState<Group>({
    name: '',
    members: [],
    imageURL: NotanglesLogo,
    privacy: Privacy.PRIVATE,
  });

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
          visibility: group.privacy,
          timetableIDs: [],
          memberIDs: group.members.map((member) => member.zID),
          groupAdminIDs: [],
          imageURL: group.imageURL,
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
    updateFormState({
      name: '',
      members: [],
      imageURL: NotanglesLogo,
      privacy: Privacy.PRIVATE,
    });
  };

  return (
    <>
      <Tooltip title="Add a Group" placement="right">
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
