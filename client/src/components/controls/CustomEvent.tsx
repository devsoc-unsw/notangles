import React, { useContext, useState } from 'react';
import CreateEventPopover from '../timetable/CreateEventPopover';
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Box, Button, Popover } from '@mui/material';
import { styled } from '@mui/system';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { StyledControlsButton } from '../../styles/ControlStyles';
import { createDateWithTime } from '../../utils/eventTimes';

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
      <CreateEventPopover
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
        isDoubleClicked={false}
        initialStartTime={createDateWithTime(9)}
        initialEndTime={createDateWithTime(10)}
        initialDay={''}
        tempEventId={''}
      />
    </StyledControlsButton>
  );
};

export default CustomEvent;
