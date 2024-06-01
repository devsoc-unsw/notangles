import React, { useState } from 'react';
import { Add as AddIcon } from '@mui/icons-material';
import { Dialog, IconButton, Tooltip } from '@mui/material';
import AddGroupDialogActions from './AddGroupDialogActions';
import AddGroupDialogTitle from './AddGroupDialogTitle';
import AddGroupDialogContent from './AddGroupDialogContent';
import NetworkError from '../../../interfaces/NetworkError';
import { API_URL } from '../../../api/config';
import NotanglesLogo from '../../../assets/notangles_1.png';

export interface FriendType {
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

const AddGroupDialog: React.FC<AddGroupDialogProps> = ({ getGroups }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<FriendType[]>([]);
  const [groupImageURL, setGroupImageURL] = useState(NotanglesLogo);
  const [privacy, setPrivacy] = useState<Privacy>(Privacy.PRIVATE);

  const isCorrectInputs = () => {
    return groupName && selectedFriends.length;
  };

  const handleCreateGroup = async () => {
    if (!isCorrectInputs) return;

    try {
      const res = await fetch(`${API_URL.server}/group`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          visibility: 'PRIVATE',
          timetableIDs: [],
          memberIDs: selectedFriends.map((friend) => friend.zID),
          groupAdminIDs: [],
          imageURL: groupImageURL,
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
    setGroupName('');
    setSelectedFriends([]);
    setGroupImageURL('');
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
        <AddGroupDialogContent
          groupImageURL={groupImageURL}
          setGroupImageURL={setGroupImageURL}
          setGroupName={setGroupName}
          setSelectedFriends={setSelectedFriends}
          setPrivacy={setPrivacy}
          privacy={privacy}
        />
        <AddGroupDialogActions handleClose={handleClose} handleCreateGroup={handleCreateGroup} />
      </Dialog>
    </>
  );
};

export default AddGroupDialog;
