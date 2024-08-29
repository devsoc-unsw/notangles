import { Add as AddIcon, Edit } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  styled,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Close as CloseIcon } from '@mui/icons-material';

import { API_URL } from '../../../api/config';
import NetworkError from '../../../interfaces/NetworkError';
import AddOrEditGroupDialogContent from './AddOrEditGroupDialogContent';
import { User } from './GroupsSidebar';

export enum Privacy {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export interface Group {
  id: string;
  name: string;
  description: string;
  visibility: Privacy;
  timetableIDs: string[];
  memberIDs: string[];
  groupAdminIDs: string[];
  imageURL: string;
}

interface AddGroupDialogProps {
  editGroupData?: Group;
  user: User | undefined;
  onClose: () => void;
}

const StyledDialogTitle = styled(DialogTitle)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const StyledDialogActions = styled(DialogActions)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 0px 30px 30px 0px;
`;

const AddOrEditGroupDialog: React.FC<AddGroupDialogProps> = ({ editGroupData, user, onClose }) => {
  if (!user) return <></>;

  const emptyGroupData: Group = {
    id: '',
    name: '',
    description: '',
    visibility: Privacy.PRIVATE,
    timetableIDs: [],
    memberIDs: [],
    groupAdminIDs: [user.userID],
    imageURL: '',
  };

  const [isOpen, setIsOpen] = useState(false);
  const [group, setGroup] = useState<Group>(emptyGroupData);

  useEffect(() => {
    setGroup({ ...group, groupAdminIDs: [user.userID] });
  }, [user.userID]);

  useEffect(() => {
    setGroup(editGroupData ? editGroupData : emptyGroupData);
  }, [editGroupData]);

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
          description: group.description,
          visibility: group.visibility,
          timetableIDs: group.timetableIDs,
          memberIDs: group.memberIDs,
          groupAdminIDs: group.groupAdminIDs,
          imageURL: group.imageURL,
        }),
      });
      const groupCreationStatus = await res.json();
      console.log('group creation status', groupCreationStatus.data); // Can see the status of group creation here!

      if (res.status === 201) {
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
          description: group.description,
          visibility: group.visibility,
          timetableIDs: group.timetableIDs,
          memberIDs: group.memberIDs,
          groupAdminIDs: group.groupAdminIDs,
          imageURL: group.imageURL,
        }),
      });
      const groupCreationStatus = await res.json();
      console.log('group update status', groupCreationStatus.data); // Can see the status of group creation here!
      if (res.status === 200) {
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
      description: '',
      visibility: Privacy.PRIVATE,
      timetableIDs: [],
      memberIDs: [],
      groupAdminIDs: [user.userID],
      imageURL: '',
    });
    onClose();
  };

  return (
    <>
      <div>
        {editGroupData ? (
          <MenuItem onClick={() => setIsOpen(true)}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
        ) : (
          <Tooltip title="Add a Group" placement="right">
            <IconButton color="inherit" onClick={() => setIsOpen(true)}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>

      <Dialog disableScrollLock onClose={handleClose} open={isOpen} fullWidth maxWidth="sm">
        <>
          <StyledDialogTitle>
            <Typography variant="h6">{editGroupData ? 'Edit Group Details' : 'Create a Group'}</Typography>
            <div>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </div>
          </StyledDialogTitle>
        </>
        <AddOrEditGroupDialogContent user={user} group={group} setGroup={setGroup} />
        <StyledDialogActions>
          <Button variant="text" onClick={handleClose}>
            Cancel
          </Button>
          {editGroupData ? (
            <Button variant="contained" onClick={() => handleEditGroup(group.id)}>
              Save Changes
            </Button>
          ) : (
            <Button variant="contained" onClick={handleCreateGroup}>
              Create
            </Button>
          )}
        </StyledDialogActions>
      </Dialog>
    </>
  );
};

export default AddOrEditGroupDialog;
