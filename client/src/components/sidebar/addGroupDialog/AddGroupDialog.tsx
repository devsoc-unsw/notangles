import React, { useState } from 'react';
import { Add as AddIcon } from '@mui/icons-material';
import { Dialog, IconButton, Tooltip } from '@mui/material';
import AddGroupDialogActions from './AddGroupDialogActions';
import AddGroupDialogTitle from './AddGroupDialogTitle';
import AddGroupDialogContent from './AddGroupDialogContent';


export interface FriendType {
  name: string;
  zID: number;
}

const AddGroupDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<FriendType[]>([]);
  const [groupImageURL, setGroupImageURL] = useState('');

  const handleCreateGroup = () => {
    // TODO call API
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
        />
        <AddGroupDialogActions handleClose={handleClose} handleCreateGroup={handleCreateGroup} />
      </Dialog>
    </>
  );
};

export default AddGroupDialog;
