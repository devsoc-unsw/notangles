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

const AddGroupDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<FriendType[]>([]);
  const [groupImageURL, setGroupImageURL] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  const handleCreateGroup = async () => {
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
            visibility: 'PRIVATE',
            timetableIDs: ['0', '1', '2'],
            memberIDs: selectedFriends.map((friend) => friend.zID),
            groupAdmins: ['0'],
            groupImageURL: groupImageURL,
          },
          groupID: 0,
        }),
      });

      if (res.status !== 200) throw new NetworkError("Couldn't get response");

      // return anything
    } catch (error) {
      throw new NetworkError("Couldn't get response");
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
          setIsPrivate={setIsPrivate}
          isPrivate={isPrivate}
        />
        <AddGroupDialogActions handleClose={handleClose} handleCreateGroup={handleCreateGroup} />
      </Dialog>
    </>
  );
};

export default AddGroupDialog;
