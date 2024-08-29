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
  TextField,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';
import EditImagePopOver from './EditImagePopover';
import NotanglesLogo from '../../../assets/notangles_1.png';
import { Group, Privacy } from './AddOrEditGroupDialog';
import { User } from './GroupsSidebar';

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
  user: User;
  group: Group;
  setGroup: (group: Group) => void;
}

const AddOrEditGroupDialogContent: React.FC<AddGroupDialogContentProps> = ({ user, group, setGroup }) => {
  console.log('user', user)
  console.log('group', group)
  return (
    <StyledDialogContent>
      <StyledUploadImageContainer>
        <label>
          <CircleOutline>{<CircleImage src={group.imageURL || NotanglesLogo} />}</CircleOutline>
        </label>
        <EditImagePopOver group={group} setGroup={setGroup} />
      </StyledUploadImageContainer>

      <TextField
        label="Group Name"
        defaultValue={group.name}
        required
        fullWidth
        onChange={(e) => setGroup({ ...group, name: e.target.value })}
      />
      <TextField
        label="Description"
        defaultValue={group.description}
        required
        fullWidth
        onChange={(e) => setGroup({ ...group, description: e.target.value })}
      />

      <Autocomplete
        multiple
        options={user.friends}
        disableCloseOnSelect
        fullWidth
        value={user.friends.filter((friend: User) => group.memberIDs.includes(friend.userID))}
        onChange={(_, value) => setGroup({ ...group, memberIDs: value.map((val) => val.userID) })}
        getOptionLabel={(option) => option.userID}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={<RadioButtonUncheckedIcon fontSize="small" />}
              checkedIcon={<CheckCircleIcon fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {`${option.firstname} ${option.lastname}`}
          </li>
        )}
        renderTags={(tagValue, getTagProps) => {
          return tagValue.map((option, index) => (
            <Tooltip title={'z' + option.userID}>
              <Chip {...getTagProps({ index })} label={option.firstname} />
            </Tooltip>
          ));
        }}
        renderInput={(params) => <TextField {...params} label="Group Members" placeholder="Search for names..." />}
      />

      <FormControl fullWidth>
        <InputLabel id="select-privacy">Group Privacy</InputLabel>
        <Select
          labelId="select-privacy"
          defaultValue={group.visibility}
          value={group.visibility}
          label="Group Privacy"
          onChange={(e) => setGroup({ ...group, visibility: e.target.value as Privacy })}
        >
          <MenuItem value={Privacy.PRIVATE}>Private</MenuItem>
          <MenuItem value={Privacy.PUBLIC}>Public</MenuItem>
        </Select>
      </FormControl>
    </StyledDialogContent>
  );
};

export default AddOrEditGroupDialogContent;
