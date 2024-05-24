import React from 'react';
import { CheckCircle as CheckCircleIcon, RadioButtonUnchecked as RadioButtonUncheckedIcon } from '@mui/icons-material';
import { Autocomplete, Checkbox, Chip, DialogContent, Switch, TextField, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import EditImagePopOver from './EditImagePopOver';
import { friends } from './dummyData';
import { FriendType } from './AddGroupDialog';

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

const StyledPrivacyContainer = styled('div')`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

interface AddGroupDialoContentProps {
  groupImageURL: string;
  setGroupImageURL: (url: string) => void;
  setGroupName: (groupName: string) => void;
  setSelectedFriends: (friends: FriendType[]) => void;
  isPrivate: boolean;
  setIsPrivate: (isPrivate: boolean) => void;
}

const AddGroupDialogContent: React.FC<AddGroupDialoContentProps> = ({
  groupImageURL,
  setGroupImageURL,
  setGroupName,
  setSelectedFriends,
  isPrivate,
  setIsPrivate,
}) => {
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

      <StyledPrivacyContainer>
        <div>Private Group</div>
        <Switch checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
      </StyledPrivacyContainer>
    </StyledDialogContent>
  );
};

export default AddGroupDialogContent;
