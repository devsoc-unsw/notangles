import { Class, Event } from '@mui/icons-material';
import { ListItemIcon } from '@mui/material';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import { StyledListItem } from '../../../../styles/ControlStyles';

interface CustomEventsTutoringFormProps {
  setTutoringEventFormSatisfied: (satisfied: boolean) => void;
}

const CustomEventsTutoringForm = forwardRef(({ setTutoringEventFormSatisfied }: CustomEventsTutoringFormProps, ref) => {
  const [courseCode, setCourseCode] = useState<string>('');
  const [classCode, setClassCode] = useState<string>('');
  const [classesCodes, setClassesCodes] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    setTutoringEventFormSatisfied(!!courseCode && !!classCode);
  }, [courseCode, classCode, setTutoringEventFormSatisfied]);

  const handleCreateEvent = () => {
    // TODO: implement tutoring event creation
  };
  useImperativeHandle(ref, () => ({
    handleCreateEvent,
  }));
  return (
    <>
      <StyledListItem>
        <ListItemIcon>
          <Event />
        </ListItemIcon>
        {/* <Autocomplete
          disablePortal
          options={coursesCodes}
          renderInput={(params) => <TextField {...params} label="Course code *" />}
          fullWidth
          autoHighlight
          noOptionsText="No Results"
          onChange={(_, value) => {
            value ? setCourseCode(value.label) : setCourseCode('');
          }}
          renderOption={(props, option) => {
            return (
              <li {...props} key={option.id}>
                {option.label}
              </li>
            );
          }}
          isOptionEqualToValue={(option, value) => option.id === value.id && option.label === value.label}
          ListboxProps={{
            style: {
              maxHeight: '120px',
            },
          }}
        /> */}
      </StyledListItem>
      <StyledListItem>
        <ListItemIcon>
          <Class />
        </ListItemIcon>
        {/* <Autocomplete
          disablePortal
          options={classesCodes}
          renderInput={(params) => <TextField {...params} label="Class code *" />}
          fullWidth
          autoHighlight
          noOptionsText="No Results"
          onChange={(_, value) => {
            value ? setClassCode(value.label) : setClassCode('');
          }}
          renderOption={(props, option) => {
            return (
              <li {...props} key={option.id}>
                {option.label}
              </li>
            );
          }}
          isOptionEqualToValue={(option, value) => option.id === value.id && option.label === value.label}
          ListboxProps={{
            style: {
              maxHeight: '120px',
            },
          }}
        /> */}
      </StyledListItem>
    </>
  );
});

CustomEventsTutoringForm.displayName = 'CustomEventsTutoringForm';
export default CustomEventsTutoringForm;
