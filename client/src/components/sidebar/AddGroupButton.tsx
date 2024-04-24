import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
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
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import React, { useState } from 'react';

const StyledDialogTitle = styled(DialogTitle)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  margin: 0;
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const StyledDialogActions = styled(DialogActions)`
  background-color: ${({ theme }) => theme.palette.background.paper}; // darkmode
`;

const StyledTypography = styled(Typography)`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const ShowModalButton = styled(IconButton)`
  margin-right: 5px;
`;

const StyledDialogContent = styled(DialogContent)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 20px;
  margin-top: 20px;
  gap: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CircleOutline = styled('div')`
  width: 150px;
  height: 150px;
  border-radius: 999px;
  border: 0.5px solid black;
  cursor: pointer;
`;

const EditCircleLabel = styled('label')`
  background-color: white;
  border: 0.5px solid black;
  border-radius: 999px;
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  top: -35px;
  &:hover {
    cursor: pointer;
  }
`;

interface HiddenUploadFileProps {
  setSelectedFileImage: (file: null | File) => void;
}

const HiddenUploadFile: React.FC<HiddenUploadFileProps> = ({ setSelectedFileImage }) => {
  return (
    <input
      type="file"
      style={{ display: 'none' }}
      accept="image/*"
      onChange={(event) => {
        if (event?.target?.files) {
          if (event?.target?.files.length === 0) return;
          setSelectedFileImage(event.target.files[0]);
        }
      }}
    />
  );
};

const AddGroupButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<FriendsType[]>([]);
  const [selectedFileImage, setSelectedFileImage] = useState<null | File>(null);

  const handleCreateGroup = () => {
    // TODO call API
  };

  const handleClose = () => {
    setIsOpen(false);
    setGroupName('');
    setSelectedFriends([]);
    setSelectedFileImage(null);
  };

  const handleDeleteSelectedMember = (zID: number) => {
    setSelectedFriends(selectedFriends.filter((friend) => friend.zID !== zID));
  };

  return (
    <>
      {/** + Button **/}
      <Tooltip title="Add a Group">
        <ShowModalButton color="inherit" onClick={() => setIsOpen(true)}>
          <AddIcon />
        </ShowModalButton>
      </Tooltip>

      <Dialog disableScrollLock onClose={handleClose} open={isOpen} fullWidth maxWidth="sm">
        <StyledDialogTitle>
          <StyledTypography variant="h6">Create a Group</StyledTypography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>

        <StyledDialogContent>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <label>
              <CircleOutline>
                {selectedFileImage && (
                  <img
                    style={{ width: 150, height: 150, borderRadius: 999, objectFit: 'cover' }}
                    src={URL.createObjectURL(selectedFileImage)}
                  />
                )}
              </CircleOutline>

              <HiddenUploadFile setSelectedFileImage={setSelectedFileImage} />
            </label>
            <EditCircleLabel>
              <EditIcon />
              <HiddenUploadFile setSelectedFileImage={setSelectedFileImage} />
            </EditCircleLabel>
          </div>

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

        {/** FOOTER BUTTONS **/}
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
