import React, { useState } from 'react';
import { AccessTime, ArrowDropDown, ArrowDropUp, LocationOn } from '@mui/icons-material';
import { Box, Button, Popover, List, ListItem, ListItemText, ListItemIcon, Grid, TextField, Slider } from '@mui/material';
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

const ExecuteButton = styled(Button)`
  width: 100%;
  border-radius: 0px 0px 5px 5px;
`;

const CustomEvents = ({}) => {
  // for opening popover

  //anchorEL sets position of the popover, useState to see if popover should show or not
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  //if trye, the popover is shown, currently set to the same as anchorEL
  const open = Boolean(anchorEl);

  // Function to open popover when Event button is clicked
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
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
        {open ? <ArrowDropUp /> : <ArrowDropDown />}
      </DropdownButton>

      {/*Code for Popover */}
      {/*Where the popover appears in relation to the button */}
      <Popover
        // id={popoverId}
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
          <ListItem>
            <Grid container spacing={0} sx={{ paddingLeft: 9 }}>
              <TextField id="eventName-basic" label="Add Event Name" variant="standard" />
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container spacing={0} sx={{ paddingLeft: 9 }}>
              <TextField id="description-basic" label="Add Description" variant="standard" multiline />
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container spacing={0}>
              <ListItem>
                <ListItemIcon sx={{ paddingTop: 1 }}>
                  <LocationOn />
                </ListItemIcon>
                <TextField id="location-basic" label="Add Location" variant="standard" fullWidth />
              </ListItem>
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container spacing={0}>
              <ListItem>
                <ListItemIcon>
                  <AccessTime />
                </ListItemIcon>
                <ListItemText primary="Select Duration (hours)" />
              </ListItem>
              <Slider valueLabelDisplay="auto" step={1} min={0} max={12} />
            </Grid>
          </ListItem>

          <ListItem></ListItem>
        </StyledList>
        <ExecuteButton variant="contained" color="primary" disableElevation>
          CREATE
        </ExecuteButton>
      </Popover>
    </div>
  );
};

export default CustomEvents;
