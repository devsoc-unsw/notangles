import { Link } from '@mui/icons-material';
import { ListItemIcon, TextField } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { daysShort } from '../../constants/timetable';
import { CustomEventInviteProp } from '../../interfaces/PropTypes';
import { StyledListItem, StyledListItemText } from '../../styles/CustomEventStyles';
import { areValidEventTimes } from '../../utils/eventTimes';
import DropdownOption from '../timetable/DropdownOption';

const CustomEventInvite: React.FC<CustomEventInviteProp> = ({ link, setLink }) => {
  return (
    <>
      <StyledListItem>
        <ListItemIcon>
          <Link />
        </ListItemIcon>
        <TextField
          id="outlined-required"
          label="Event Url"
          onChange={(e) => setLink(e.target.value)}
          variant="outlined"
          fullWidth
          required
          defaultValue={link}
        />
      </StyledListItem>
    </>
  );
};

export default CustomEventInvite;
