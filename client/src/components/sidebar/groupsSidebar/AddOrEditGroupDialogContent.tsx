import { CheckCircle as CheckCircleIcon, RadioButtonUnchecked as RadioButtonUncheckedIcon } from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/system';
import React, { useState } from 'react';

import { API_URL } from '../../../api/config';
import NotanglesLogo from '../../../assets/notangles_1.png';
import { Group, Privacy } from '../../../interfaces/Group';
import NetworkError from '../../../interfaces/NetworkError';
import { User } from '../UserAccount';
import EditImagePopOver from './EditImagePopover';

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

const StyledDialogActions = styled(DialogActions)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 0px 30px 30px 0px;
`;

interface AddGroupDialogContentProps {
  user: User;
  group: Group;
  setGroup: (group: Group) => void;
  handleClose: () => void;
  isEditing: boolean;
}

enum InputError {
  GROUP_NAME = 'Group name must be at least 1 character',
  GROUP_DESCRIPTION = 'Group description must be at least 1 character',
  GROUP_MEMBERS = 'You must select at least 1 friend',
}

const AddOrEditGroupDialogContent: React.FC<AddGroupDialogContentProps> = ({
  user,
  group,
  setGroup,
  handleClose,
  isEditing,
}) => {
  const [errorMessage, setErrorMessage] = useState('');

  const checkInputs = () => {
    if (group.name.length < 1) {
      setErrorMessage(InputError.GROUP_NAME);
    } else if (group.description.length < 1) {
      setErrorMessage(InputError.GROUP_DESCRIPTION);
    } else if (group.members.length < 1) {
      setErrorMessage(InputError.GROUP_MEMBERS);
    }
    return group.name.length >= 1 && group.description.length >= 1 && group.members.length >= 1;
  };

  const handleCreateGroup = async () => {
    if (!checkInputs()) return;

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
          timetableIDs: group.timetables.map((timetable) => timetable.id),
          memberIDs: group.members.map((member) => member.userID),
          groupAdminIDs: group.groupAdmins.map((groupAdmin) => groupAdmin.userID),
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
    if (!checkInputs()) return;
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
          timetableIDs: group.timetables.map((timetable) => timetable.id),
          memberIDs: group.members.map((member) => member.userID),
          groupAdminIDs: group.groupAdmins.map((groupAdmin) => groupAdmin.userID),
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

  return (
    <>
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
          error={errorMessage === InputError.GROUP_NAME}
          helperText={errorMessage === InputError.GROUP_NAME ? InputError.GROUP_NAME : ''}
        />
        <TextField
          label="Description"
          defaultValue={group.description}
          required
          fullWidth
          onChange={(e) => setGroup({ ...group, description: e.target.value })}
          error={errorMessage === InputError.GROUP_DESCRIPTION}
          helperText={errorMessage === InputError.GROUP_DESCRIPTION ? InputError.GROUP_DESCRIPTION : ''}
        />

        <Autocomplete
          multiple
          options={user.friends}
          disableCloseOnSelect
          fullWidth
          value={group.members}
          onChange={(_, value) => setGroup({ ...group, members: value})}
          getOptionLabel={(option) => `${option.firstname} ${option.lastname} ${option.userID}`} // What the search query is based on
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
              <Tooltip title={option.userID}>
                <Chip {...getTagProps({ index })} label={option.firstname} />
              </Tooltip>
            ));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Group Members"
              placeholder="Search for names..."
              error={errorMessage === InputError.GROUP_MEMBERS}
              helperText={errorMessage === InputError.GROUP_MEMBERS ? InputError.GROUP_MEMBERS : ''}
            />
          )}
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
      <StyledDialogActions>
        <Button variant="text" onClick={handleClose}>
          Cancel
        </Button>
        {isEditing ? (
          <Button variant="contained" onClick={() => handleEditGroup(group.id)}>
            Save Changes
          </Button>
        ) : (
          <Button variant="contained" onClick={handleCreateGroup}>
            Create
          </Button>
        )}
      </StyledDialogActions>
    </>
  );
};

export default AddOrEditGroupDialogContent;
