import React, { useContext, useState } from 'react';
import { Add, ArrowDropDown, ArrowDropUp, Event, LocationOn, Notes } from '@mui/icons-material';
import { Box, Button, ListItem, ListItemIcon, Popover, TextField } from '@mui/material';
import { styled } from '@mui/system';
import { TimePicker } from '@mui/x-date-pickers';
import { Colorful } from '@uiw/react-color';
import { daysShort } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { EventPeriod } from '../../interfaces/Periods';
import { ColourIndicatorBox, StyledButtonContainer, StyledControlsButton } from '../../styles/ControlStyles';
import { ExecuteButton, StyledListItem, StyledListItemText } from '../../styles/CustomEventStyles';
import { StyledList } from '../../styles/DroppedCardStyles';
import { createNewEvent } from '../../utils/createEvent';
import { areValidEventTimes, createDateWithTime } from '../../utils/eventTimes';
import DropdownOption from '../timetable/DropdownOption';
import CreateEventPopover from '../../utils/CreateEventPopover';

const DropdownButton = styled(Button)`
  && {
    width: 100%;
    height: 55px;
    margin-top: 20px;
    margin-right: 10px;
    text-align: left;
    &:hover {
      background-color: #598dff;
    }
  }
`;

const CustomEvent: React.FC = () => {
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);
  const { setAlertMsg, setErrorVisibility, setDays, earliestStartTime, setEarliestStartTime, latestEndTime, setLatestEndTime } =
    useContext(AppContext);

  const [createEventAnchorEl, setCreateEventAnchorEl] = useState<HTMLDivElement | HTMLButtonElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCreateEventAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setCreateEventAnchorEl(null);
  };

  const openCreateEventPopover = Boolean(createEventAnchorEl);
  const popoverId = openCreateEventPopover ? 'simple-popover' : undefined;

  return (
    <StyledControlsButton>
      <DropdownButton disableElevation aria-describedby={popoverId} variant="contained" onClick={handleOpen}>
        <Box ml="1px" flexGrow={1} marginTop="3px">
          CREATE EVENT
        </Box>
        {openCreateEventPopover ? <ArrowDropUp /> : <ArrowDropDown />}
      </DropdownButton>
      <Popover
        open={openCreateEventPopover}
        anchorEl={createEventAnchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <CreateEventPopover onClickCreate={handleClose} />
      </Popover>
    </StyledControlsButton>
  );
};

export default CustomEvent;
