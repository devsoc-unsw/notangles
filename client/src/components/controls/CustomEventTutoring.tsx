import { Event } from '@mui/icons-material';
import ClassIcon from '@mui/icons-material/Class';
import { Autocomplete, ListItemIcon, TextField } from '@mui/material';
import { CustomEventTutoringProp } from '../../interfaces/PropTypes';
import { StyledListItem } from '../../styles/CustomEventStyles';

const CustomEventTutoring: React.FC<CustomEventTutoringProp> = ({ coursesCodes, classesCodes, setCourseCode, setClassCode }) => {
  return (
    <>
      <StyledListItem>
        <ListItemIcon>
          <Event />
        </ListItemIcon>
        <Autocomplete
          disablePortal
          options={coursesCodes}
          renderInput={(params) => <TextField {...params} label="Course code *" />}
          fullWidth
          autoHighlight
          noOptionsText="No Results"
          onChange={(_, value) => (value ? setCourseCode(value.label) : setCourseCode(''))}
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
        />
      </StyledListItem>
      <StyledListItem>
        <ListItemIcon>
          <ClassIcon />
        </ListItemIcon>
        <Autocomplete
          disablePortal
          options={classesCodes}
          renderInput={(params) => <TextField {...params} label="Class code *" />}
          fullWidth
          autoHighlight
          noOptionsText="No Results"
          onChange={(_, value) => (value ? setClassCode(value.label) : setClassCode(''))}
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
        />
      </StyledListItem>
    </>
  );
};

export default CustomEventTutoring;
