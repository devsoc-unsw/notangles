import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Box, Popover } from '@mui/material';
import { useMemo, useState } from 'react';

import { Term } from '../../../../api/times/times';
import { StyledControlsButton } from '../../../../styles/ControlStyles';
import { DropdownButton } from '../../../../styles/CustomEventStyles';
import CustomEventsForm from './CustomEventsForm';

interface CustomEventsProps {
  term: Term;
  timetableId: string;
}

const CustomEvents = ({ term, timetableId }: CustomEventsProps) => {
  const [createEventAnchorEl, setCreateEventAnchorEl] = useState<null | HTMLElement>(null);
  const popoverId = useMemo(() => (createEventAnchorEl ? 'create-event-popover' : undefined), [createEventAnchorEl]);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCreateEventAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setCreateEventAnchorEl(null);
  };

  return (
    <StyledControlsButton>
      <DropdownButton disableElevation aria-describedby={popoverId} variant="contained" onClick={handlePopoverOpen}>
        <Box ml="1px" flexGrow={1} marginTop="3px">
          Create Event
        </Box>
        {createEventAnchorEl ? <ArrowDropUp /> : <ArrowDropDown />}
      </DropdownButton>
      <Popover
        id={popoverId}
        open={!!popoverId}
        anchorEl={createEventAnchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <CustomEventsForm term={term} handlePopoverClose={handlePopoverClose} timetableId={timetableId} />
      </Popover>
    </StyledControlsButton>
  );
};

export default CustomEvents;
