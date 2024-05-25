import React, { useState } from 'react';
import { Add as AddIcon } from '@mui/icons-material';
import { Dialog, IconButton, Tooltip } from '@mui/material';
import AddGroupDialogActions from './AddGroupDialogActions';
import AddGroupDialogTitle from './AddGroupDialogTitle';
import AddGroupDialogContent from './AddGroupDialogContent';
import NetworkError from '../../../interfaces/NetworkError';
import { API_URL } from '../../../api/config';

export interface FriendType {
  name: string;
  zID: string;
}

export enum Visibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

const AddGroupDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<FriendType[]>([]);
  const [groupImageURL, setGroupImageURL] = useState('');
  const [visibility, setVisibility] = useState<Visibility>(Visibility.PRIVATE);

  const handleCreateGroup = async () => {
    console.log('RAY' + API_URL.timetable);
    try {
      const res = await fetch(`${API_URL.timetable}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupData: {
            name: groupName,
            visibility: visibility,
            timetableIDs: ['0', '1', '2'],
            memberIDs: selectedFriends.map((friend) => friend.zID),
            groupAdmins: ['0'],
            groupImageURL: groupImageURL,
          },
          groupID: 0,
        }),
      });

      if (res.status !== 200) throw new NetworkError("Couldn't get response");
      console.log('group created success')
      handleClose();
    } catch (error) {
      throw new NetworkError("Couldn't get response");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setGroupName('');
    setSelectedFriends([]);
    setGroupImageURL('');
    setVisibility(Visibility.PRIVATE);
  };

  return (
    <>
      <Tooltip title="Add a Group">
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
          setVisibility={setVisibility}
          visibility={visibility}
        />
        <AddGroupDialogActions handleClose={handleClose} handleCreateGroup={handleCreateGroup} />
      </Dialog>
    </>
  );
};

export default AddGroupDialog;
