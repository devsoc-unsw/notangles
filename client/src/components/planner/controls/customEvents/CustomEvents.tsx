import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useState } from 'react';

import { StyledControlsButton } from '../../../../styles/ControlStyles';
import { DropdownButton } from '../../../../styles/CustomEventStyles';

const CustomEvent: React.FC = () => {
  const [createEventAnchorEl, setCreateEventAnchorEl] = useState<null | HTMLElement>(null);
  const openCreateEventPopover = Boolean(createEventAnchorEl);
  const popoverId = openCreateEventPopover ? 'create-event-popover' : undefined;

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCreateEventAnchorEl(event.currentTarget);
  };

  // TODO: Implement create event popover
  return (
    <StyledControlsButton>
      <DropdownButton disableElevation aria-describedby={popoverId} variant="contained" onClick={handleOpen}>
        <Box
          sx={{
            ml: '1px',
            flexGrow: 1,
            marginTop: '3px',
          }}
        >
          CREATE EVENT
        </Box>
        {openCreateEventPopover ? <ArrowDropUp /> : <ArrowDropDown />}
      </DropdownButton>
    </StyledControlsButton>
  );
};

export default CustomEvent;
