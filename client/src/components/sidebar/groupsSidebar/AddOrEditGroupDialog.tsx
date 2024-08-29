import { Add as AddIcon, Edit } from '@mui/icons-material';
import {
  Dialog,
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
        <AddOrEditGroupDialogContent
          user={user}
          group={group}
          setGroup={setGroup}
          handleClose={handleClose}
          isEditing={editGroupData !== undefined}
        />
      </Dialog>
    </>
  );
};

export default AddOrEditGroupDialog;
