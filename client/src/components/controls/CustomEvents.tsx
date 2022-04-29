import React, { useState } from 'react';
import { AccessTime, LocationOn } from '@mui/icons-material';
import {
  Box,
  Button,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  TextField
} from '@mui/material';
import { styled } from '@mui/system';

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

const StyledList = styled(List)`
  padding: 0 15px;
`;

const CustomEvents = ({ }) => {
  // for opening popover

  //anchorEL sets position of the popover, useState to see if popover should show or not
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  //if trye, the popover is shown, currently set to the same as anchorEL
  const open = Boolean(anchorEl);

  // Function to open popover when Event button is clicked
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  };

  //Close popover when Event button is clicked again
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Create Event Button */}
      <DropdownButton variant="contained" onClick={handleClick}>
        <Box ml="1px" flexGrow={1} marginTop="3px">
          CREATE EVENT
        </Box>
      </DropdownButton>

      {/*Code for Popover */}
      {/*Where the popover appears in relation to the button */}
      <Popover
        open={open}
        anchorEl={anchorEl}
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
        <StyledList>
          <Grid container spacing={0}>
            <Grid item xs={7} >
              <ListItem>
                <ListItemText primary="Event Name" />
              </ListItem>
            </Grid>
            <Grid item xs={5}>
              <TextField id="eventName-basic" label="Event Name" variant="standard" />
            </Grid>
          </Grid>

          <ListItem>
            <ListItemIcon>
              <LocationOn />
            </ListItemIcon>
            <ListItemText primary="Location" />
            <Grid item xs={5}>
              <TextField id="location-basic" label="Location" variant="standard" />
            </Grid>
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <AccessTime />
            </ListItemIcon>
            <ListItemText primary="Duration" />
          </ListItem>
        </StyledList>
      </Popover>
    </div >
  );
};

export default CustomEvents;
