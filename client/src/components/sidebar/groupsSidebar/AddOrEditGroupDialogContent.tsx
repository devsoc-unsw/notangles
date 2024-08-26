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
import { Group, Privacy, MemberType } from './AddOrEditGroupDialog';

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
  group: Group;
  setGroup: (group: Group) => void;
}

export const dummyFriends: MemberType[] = [
  { name: 'Shaam', zID: 'z532445' },
  { name: 'Ray', zID: 'z523495' },
  { name: 'hhlu', zID: 'z584290' },
  { name: 'Sohum', zID: 'z523840' },
  { name: 'Chanel', zID: 'z542567' },
  { name: 'Nikki', zID: 'z524596' },
  { name: 'Micky', zID: 'z523948' },
  { name: 'Jasmine', zID: 'z5394841' },
];

const AddOrEditGroupDialogContent: React.FC<AddGroupDialogContentProps> = ({ group, setGroup }) => {
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
        options={dummyFriends}
        disableCloseOnSelect
        fullWidth
        onChange={(_, value) => setGroup({ ...group, memberIDs: value.map((val) => val.zID) })}
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
