import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Popover,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import React, { useState } from 'react';

const StyledDialogTitle = styled(DialogTitle)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 40px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const StyledDialogActions = styled(DialogActions)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 0px 60px 30px 0px;
`;

const StyledDialogContent = styled(DialogContent)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 40px 60px;
  gap: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Circle = `
  width: 150px;
  height: 150px;
  border-radius: 999px;
`;

const CircleOutline = styled('div')`
  ${Circle}
  border: 1px solid gray;
  cursor: pointer;
`;

const CircleImage = styled('img')`
  ${Circle}
  object-fit: cover;
`;

const EditIconCircle = styled('div')`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid gray;
  border-radius: 999px;
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  top: -35px;
  cursor: pointer;
  &:hover {
    border: ${({ theme }) => (theme.palette.mode === 'light' ? '1px solid black' : '1px solid white;')};
  }
`;

const StyledUploadImageContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

interface EditImagePopOverProps {
  groupImageURL: string;
  setGroupImageURL: (url: string) => void;
}

const EditImagePopOver: React.FC<EditImagePopOverProps> = ({ groupImageURL, setGroupImageURL }) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  return (
    <EditIconCircle>
      <div>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <EditIcon />
        </IconButton>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <div style={{ padding: '10px 20px', width: 400 }}>
            <TextField
              placeholder="Enter image address..."
              variant="outlined"
              value={groupImageURL}
              fullWidth
              onChange={(e) => setGroupImageURL(e.target.value)}
            />
          </div>
        </Popover>
      </div>
    </EditIconCircle>
  );
};

const AddGroupButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<FriendsType[]>([]);
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
        <StyledDialogTitle>
          <Typography variant="h6">Create a Group</Typography>
          <div>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </StyledDialogTitle>

        <StyledDialogContent>
          <StyledUploadImageContainer>
            <label>
              <CircleOutline>{<CircleImage src={groupImageURL} />}</CircleOutline>
            </label>
            <EditImagePopOver groupImageURL={groupImageURL} setGroupImageURL={setGroupImageURL} />
          </StyledUploadImageContainer>

          <TextField
            label="Group Name"
            variant="outlined"
            required
            fullWidth
            onChange={(e) => setGroupName(e.target.value)}
          />

          <Autocomplete
            multiple
            options={friends}
            disableCloseOnSelect
            fullWidth
            onChange={(_, value) => setSelectedFriends(value)}
            getOptionLabel={(option) => option.name}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={<RadioButtonUncheckedIcon fontSize="small" />}
                  checkedIcon={<CheckCircleIcon fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.name}
              </li>
            )}
            renderTags={(tagValue, getTagProps) => {
              return tagValue.map((option, index) => (
                <Tooltip title={'z' + option.zID}>
                  <Chip {...getTagProps({ index })} label={option.name} />
                </Tooltip>
              ));
            }}
            renderInput={(params) => <TextField {...params} label="Group Members" placeholder="Search for names..." />}
          />
        </StyledDialogContent>

        <StyledDialogActions>
          <Button variant="text" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleClose}>
            Create
          </Button>
        </StyledDialogActions>
      </Dialog>
    </>
  );
};

/******* DUMMY FRIENDS DATABASE *******/
interface FriendsType {
  name: string;
  zID: number;
}

const friends: FriendsType[] = [
  { name: 'Shaam', zID: 532445 },
  { name: 'Ray', zID: 523495 },
  { name: 'hhlu', zID: 584290 },
  { name: 'Sohum', zID: 523840 },
  { name: 'Chanel', zID: 542567 },
  { name: 'Nikki', zID: 524596 },
  { name: 'Micky', zID: 523948 },
  { name: 'Jasmine', zID: 540938 },
];

export default AddGroupButton;
