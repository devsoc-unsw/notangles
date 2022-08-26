import React, { useContext, useState } from 'react';
import { AccessTime, Close, Delete, Edit, Event, LocationOn, Notes, Save } from '@mui/icons-material';
import { Box, Button, Dialog, Grid, IconButton, ListItem, ListItemIcon, Popover, TextField, Typography } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { Colorful } from '@uiw/react-color';
import { daysLong, daysShort } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { EventTime } from '../../interfaces/Periods';
import { ExpandedEventViewProps } from '../../interfaces/PropTypes';
import { ColourIndicatorBox, StyledButtonContainer } from '../../styles/ControlStyles';
import { StyledListItem, StyledListItemText } from '../../styles/CustomEventStyles';
import { StyledDialogContent, StyledDialogTitle, StyledTitleContainer } from '../../styles/ExpandedViewStyles';
import { areValidEventTimes } from '../../utils/areValidEventTimes';
import { to24Hour } from '../../utils/convertTo24Hour';
import { useEventDrag } from '../../utils/Drag';
import DiscardDialog from './DiscardDialog';
import DropdownOption from './DropdownOption';

const ExpandedEventView: React.FC<ExpandedEventViewProps> = ({ eventPeriod, popupOpen, handleClose }) => {
  const { name, location, description, color } = eventPeriod.event;
  const { day, start, end } = eventPeriod.time;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [openSaveDialog, setOpenSaveDialog] = useState<boolean>(false);

  const [newName, setNewName] = useState<string>(name);
  const [newDays, setNewDays] = useState<Array<string>>([daysShort[day - 1]]);
  const [newStartTime, setNewStartTime] = useState<Date>(new Date(2022, 0, 0, start, (start - Math.floor(start)) * 60));
  const [newEndTime, setNewEndTime] = useState<Date>(new Date(2022, 0, 0, end, (end - Math.floor(end)) * 60));
  const [newLocation, setNewLocation] = useState<string>(location);
  const [newDescription, setNewDescription] = useState<string>(description);

  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLButtonElement | null>(null);
  const openColorPickerPopover = Boolean(colorPickerAnchorEl);

  const [newColor, setNewColor] = useState<string>(color as string);
  const colorPickerPopoverId = openColorPickerPopover ? 'simple-popover' : undefined;

  const { createdEvents, setCreatedEvents } = useContext(CourseContext);
  const { setErrorVisibility, setAlertMsg } = useContext(AppContext);

  const handleColorClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setColorPickerAnchorEl(event.currentTarget);
  };

  const handleCloseColorPicker = () => {
    setColorPickerAnchorEl(null);
  };

  const handleFormat = (newFormats: string[]) => {
    setNewDays(newFormats);
    setIsChanged(true);
  };

  const updateEventTime = (eventTime: EventTime, id: string) => {
    setCreatedEvents({
      ...createdEvents,
      [id]: {
        ...createdEvents[id],
        time: { ...eventTime },
      },
    });

    // Update the time that appears in the TimePicker boxes when in edit mode.
    setNewDays([daysShort[eventTime.day - 1]]);

    setNewStartTime(new Date(2022, 0, 0, eventTime.start));
    setNewEndTime(new Date(2022, 0, 0, eventTime.end));
  };

  useEventDrag(updateEventTime);

  const handleUpdateEvent = (id: string) => {
    if (!areValidEventTimes(newStartTime, newEndTime)) {
      setAlertMsg('End time is earlier than start time');
      setErrorVisibility(true);
      return;
    }

    const newEventTime = {
      day: daysShort.indexOf(newDays.toString()) + 1,
      start: newStartTime.getHours() + newStartTime.getMinutes() / 60,
      end: newEndTime.getHours() + newEndTime.getMinutes() / 60,
    };

    setCreatedEvents({
      ...createdEvents,
      [id]: {
        type: 'event',
        event: {
          id: id,
          name: newName,
          location: newLocation,
          description: newDescription,
          color: newColor,
        },
        time: newEventTime,
      },
    });

    setIsEditing(false);
  };

  const handleDiscardChanges = () => {
    handleClose();
    setOpenSaveDialog(false);
    setIsEditing(false);
    setNewName(name);
    setNewLocation(location);
    setNewDescription(description);
    setNewColor(color.toString());
  };

  const handleCloseDialog = () => {
    if (isEditing && isChanged) {
      // Open a dialog to alert user that changes have not been saved when in isEditing mode
      setOpenSaveDialog(true);
    } else {
      handleClose();
    }

    setIsEditing(false);
    setIsChanged(false);
  };

  const handleDeleteEvent = (id: string) => {
    const updatedEventData = { ...createdEvents };
    delete updatedEventData[id];
    setCreatedEvents(updatedEventData);
  };

  return (
    <Dialog open={popupOpen} maxWidth="sm" onClose={handleCloseDialog}>
      {isEditing ? (
        <>
          <StyledDialogTitle>
            <StyledTitleContainer>
              <Grid container justifyContent="flex-end" alignItems="center">
                <IconButton
                  onClick={() => handleUpdateEvent(eventPeriod.event.id)}
                  disabled={newName === '' || newLocation === ''}
                >
                  <Save />
                </IconButton>
                <IconButton aria-label="delete" onClick={() => handleDeleteEvent(eventPeriod.event.id)}>
                  <Delete />
                </IconButton>
                <IconButton aria-label="close" onClick={handleCloseDialog}>
                  <Close />
                </IconButton>
              </Grid>
            </StyledTitleContainer>
          </StyledDialogTitle>
          <StyledDialogContent>
            <ListItem>
              <ListItemIcon>
                <Event />
              </ListItemIcon>
              <TextField
                fullWidth={true}
                id="outlined-required"
                required
                variant="outlined"
                value={newName}
                onChange={(e) => {
                  setIsChanged(true);
                  setNewName(e.target.value);
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Notes />
              </ListItemIcon>

              <TextField
                fullWidth={true}
                label="Description (optional)"
                id="outlined-required"
                variant="outlined"
                value={newDescription}
                multiline
                onChange={(e) => {
                  setIsChanged(true);
                  setNewDescription(e.target.value);
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LocationOn />
              </ListItemIcon>

              <TextField
                fullWidth={true}
                id="outlined-required"
                required
                variant="outlined"
                value={newLocation}
                onChange={(e) => {
                  setIsChanged(true);
                  setNewLocation(e.target.value);
                }}
              />
            </ListItem>
            <ListItem>
              <StyledListItemText primary="Start time" />
              <TimePicker
                value={newStartTime}
                renderInput={(params) => <TextField {...params} />}
                onChange={(e) => {
                  setIsChanged(true);
                  if (e) setNewStartTime(e);
                }}
              />
            </ListItem>
            <ListItem>
              <StyledListItemText primary="End time" />
              <TimePicker
                value={newEndTime}
                renderInput={(params) => {
                  const tooEarly =
                    newStartTime.getHours() + newStartTime.getMinutes() / 60 >=
                    newEndTime.getHours() + newEndTime.getMinutes() / 60;
                  return (
                    <TextField
                      {...params}
                      error={params.error || tooEarly}
                      label={tooEarly ? 'End time must be after start time' : ''}
                    />
                  );
                }}
                onChange={(e) => {
                  setIsChanged(true);
                  if (e) setNewEndTime(e);
                }}
              />
            </ListItem>
            <ListItem disablePadding={true}>
              <DropdownOption
                optionName="Days"
                optionState={newDays}
                setOptionState={handleFormat}
                optionChoices={daysShort}
                noOff
              />
            </ListItem>
            <Box m={1} display="flex" justifyContent="center" alignItems="center">
              <ColourIndicatorBox backgroundColour={newColor} />
              <StyledButtonContainer>
                <Button
                  disableElevation
                  variant="contained"
                  size="small"
                  aria-describedby={colorPickerPopoverId}
                  onClick={handleColorClick}
                >
                  Edit Colour
                </Button>
              </StyledButtonContainer>
              <Popover
                open={openColorPickerPopover}
                anchorEl={colorPickerAnchorEl}
                onClose={handleCloseColorPicker}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                <ListItem alignItems="flex-start">
                  <Colorful
                    color={newColor}
                    onChange={(e) => {
                      setIsChanged(true);
                      setNewColor(e.hex);
                    }}
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    id="outlined-required"
                    label="Hex"
                    variant="outlined"
                    value={newColor}
                    onChange={(e) => {
                      setIsChanged(true);
                      setNewColor(e.target.value);
                    }}
                  />
                </ListItem>
              </Popover>
            </Box>
          </StyledDialogContent>
        </>
      ) : (
        <>
          <DiscardDialog
            openSaveDialog={openSaveDialog}
            handleDiscardChanges={handleDiscardChanges}
            setIsEditing={setIsEditing}
            setOpenSaveDialog={setOpenSaveDialog}
          />
          <StyledDialogTitle>
            <StyledTitleContainer>
              <>{name}</>
              <Grid container justifyContent="flex-end" alignItems="center">
                <IconButton aria-label="edit" onClick={() => setIsEditing(true)} disabled={isEditing}>
                  <Edit />
                </IconButton>
                <IconButton aria-label="delete" onClick={() => handleDeleteEvent(eventPeriod.event.id)}>
                  <Delete />
                </IconButton>
                <IconButton aria-label="close" onClick={handleCloseDialog}>
                  <Close />
                </IconButton>
              </Grid>
            </StyledTitleContainer>
          </StyledDialogTitle>
          <StyledDialogContent>
            {description.length > 0 && (
              <StyledListItem>
                <ListItemIcon>
                  <Notes />
                </ListItemIcon>
                <Typography>{description}</Typography>
              </StyledListItem>
            )}
            <StyledListItem>
              <ListItemIcon>
                <LocationOn />
              </ListItemIcon>
              <Typography>{location}</Typography>
            </StyledListItem>
            <StyledListItem>
              <ListItemIcon>
                <AccessTime />
              </ListItemIcon>
              <Typography>
                {daysLong[day - 1]} {to24Hour(start)} {'\u2013'} {to24Hour(end)}
              </Typography>
            </StyledListItem>
          </StyledDialogContent>
        </>
      )}
    </Dialog>
  );
};

export default ExpandedEventView;
