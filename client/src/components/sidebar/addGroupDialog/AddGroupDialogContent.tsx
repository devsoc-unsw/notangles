import React, { useState } from 'react';
import { CheckCircle as CheckCircleIcon, RadioButtonUnchecked as RadioButtonUncheckedIcon } from '@mui/icons-material';
import {
  Autocomplete,
  Checkbox,
  Chip,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/system';
import EditImagePopOver from './EditImagePopOver';
import { friends } from './dummyData';
import { FriendType, Privacy } from './AddGroupDialog';

const StyledDialogContent = styled(DialogContent)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 30px 30px;
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
`;

const CircleImage = styled('img')`
  ${Circle}
  object-fit: cover;
`;

const StyledUploadImageContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

interface AddGroupDialogContentProps {
  groupImageURL: string;
  setGroupImageURL: (url: string) => void;
  groupName: string;
  setGroupName: (groupName: string) => void;
  selectedFriends: FriendType[];
  setSelectedFriends: (friends: FriendType[]) => void;
  privacy: Privacy;
  setPrivacy: (privacy: Privacy) => void;
}

const AddGroupDialogContent: React.FC<AddGroupDialogContentProps> = ({
  groupImageURL,
  setGroupImageURL,
  groupName,
  setGroupName,
  selectedFriends,
  setSelectedFriends,
  privacy,
  setPrivacy,
}) => {
  // To show red error only after user has interacted with the inputs.
  const [isGroupNameInteracted, setGroupNameInteracted] = useState(false);
  const [isGroupMemberInteracted, setGroupMemberInteracted] = useState(false);

  return (
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
        onBlur={() =>  setGroupNameInteracted(true)}
        error={groupName === '' && isGroupNameInteracted}
        helperText="Must be at least one character"
      />

      <Autocomplete
        multiple
        options={friends}
        disableCloseOnSelect
        fullWidth
        onChange={(_, value) => setSelectedFriends(value)}
        onBlur={(e) =>  setGroupMemberInteracted(true)}
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
        renderInput={(params) => (
          <TextField
            error={selectedFriends.length === 0 && isGroupMemberInteracted}
            helperText="Must select at least one member"
            {...params}
            label="Group Members"
            placeholder="Search for names..."
          />
        )}
      />

      <FormControl fullWidth>
        <InputLabel id="select-privacy">Group Privacy</InputLabel>
        <Select
          labelId="select-privacy"
          value={privacy}
          label="Group Privacy"
          onChange={(e) => setPrivacy(e.target.value as Privacy)}
        >
          <MenuItem value={Privacy.PRIVATE}>Private</MenuItem>
          <MenuItem value={Privacy.PUBLIC}>Public</MenuItem>
        </Select>
      </FormControl>
    </StyledDialogContent>
  );
};

export default AddGroupDialogContent;
