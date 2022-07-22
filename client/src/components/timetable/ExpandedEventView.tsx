import React, { useContext, useState } from 'react';
import { AccessTime, Close, Delete, Edit, Event, LocationOn, Notes, Save } from '@mui/icons-material';
import { Box, Dialog, Grid, IconButton, ListItem, ListItemIcon, TextField, Typography } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { Colorful } from '@uiw/react-color';
import { weekdaysLong, weekdaysShort } from '../../constants/timetable';
import { CourseContext } from '../../context/CourseContext';
import { EventTime } from '../../interfaces/Periods';
import { ExpandedEventViewProps } from '../../interfaces/PropTypes';
import { ColourButton, StyledListItem, StyledListItemText } from '../../styles/CustomEventStyles';
import { StyledDialogContent, StyledDialogTitle, StyledTitleContainer } from '../../styles/ExpandedViewStyles';
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
  const [newDays, setNewDays] = useState<Array<string>>([weekdaysShort[day - 1]]);
  const [newStartTime, setNewStartTime] = useState<Date>(new Date(2022, 0, 0, start));
  const [newEndTime, setNewEndTime] = useState<Date>(new Date(2022, 0, 0, end));
  const [newLocation, setNewLocation] = useState<string>(location);
  const [newDescription, setNewDescription] = useState<string>(description);
  const [newColor, setNewColor] = useState<string>(color);
  const [showPicker, setShowPicker] = useState<boolean>(false);


  const { createdEvents, setCreatedEvents } = useContext(CourseContext);

  const handleColorClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowPicker(!showPicker);
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

    // Updates the time that appears in the TimePicker boxes when in edit mode.
    setNewDays([weekdaysShort[eventTime.day - 1]]);
    setNewStartTime(new Date(2022, 0, 0, eventTime.start));
    setNewEndTime(new Date(2022, 0, 0, eventTime.end));
  };

  useEventDrag(updateEventTime);

  const handleUpdateEvent = (id: string) => {
    const newEventTime = {
      day: weekdaysShort.indexOf(newDays.toString()) + 1,
      start: newStartTime.getHours(),
      end: newEndTime.getHours(),
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
  };

  const handleCloseDialog = () => {
    // Another dialog to alert user changes have not been saved when in isEditing mode
    if (isEditing && isChanged) {
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

  const isHex = (color: string): boolean => {
    var hexReg = /^#([0-9a-f]{3}){1,2}$/i;
    return hexReg.test(color);
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
                views={['hours']}
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
                views={['hours']}
                value={newEndTime}
                renderInput={(params) => <TextField {...params} />}
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
                optionChoices={weekdaysShort}
                noOff
              />
            </ListItem>
            <Box m={1} display="flex" justifyContent="center" alignItems="center">
              <ColourButton variant="contained" onClick={handleColorClick}>
                Choose Color
              </ColourButton>
              {showPicker && (
                <>
                  <ListItem alignItems="flex-start">
                    <Colorful onChange={(e) => setNewColor(e.hex)} color={newColor} />
                  </ListItem>
                </>
              )}
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
                {weekdaysLong[day - 1]} {to24Hour(start)} {'\u2013'} {to24Hour(end)}
              </Typography>
            </StyledListItem>
          </StyledDialogContent>
        </>
      )}
    </Dialog>
  );
};

export default ExpandedEventView;
