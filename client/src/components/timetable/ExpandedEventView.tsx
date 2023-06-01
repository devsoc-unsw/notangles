import React, { useContext, useState } from 'react';
import { AccessTime, Close, ContentCopy, Delete, Edit, Event, Link, LocationOn, Notes, Save } from '@mui/icons-material';
import {
  Dialog,
  Grid,
  IconButton,
  InputAdornment,
  ListItem,
  ListItemIcon,
  ListItemIconProps,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import { TimePicker } from '@mui/x-date-pickers';
import { daysLong, daysShort } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { EventTime } from '../../interfaces/Periods';
import { ExpandedEventViewProps } from '../../interfaces/PropTypes';
import { ExecuteButton, StyledListItem, StyledListItemText } from '../../styles/CustomEventStyles';
import { StyledDialogContent, StyledDialogTitle, StyledTitleContainer } from '../../styles/ExpandedViewStyles';
import { to24Hour } from '../../utils/convertTo24Hour';
import { parseAndCreateEventObj } from '../../utils/createEvent';
import { useEventDrag } from '../../utils/Drag';
import { areValidEventTimes, createDateWithTime } from '../../utils/eventTimes';
import ColorPicker from '../controls/ColorPicker';
import DiscardDialog from './DiscardDialog';
import DropdownOption from './DropdownOption';

const StyledListItemIcon = styled(ListItemIcon)<ListItemIconProps & { isDarkMode: boolean }>`
  color: ${(props) => (props.isDarkMode ? '#FFFFFF' : '#212121')};
`;

const ExpandedEventView: React.FC<ExpandedEventViewProps> = ({
  eventPeriod,
  popupOpen,
  handleClose,
  setIsEditing,
  isEditing,
}) => {
  const { name, location, description, color } = eventPeriod.event;
  const { day, start, end } = eventPeriod.time;
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [openSaveDialog, setOpenSaveDialog] = useState<boolean>(false);

  const [newName, setNewName] = useState<string>(name);
  const [newDays, setNewDays] = useState<Array<string>>([daysShort[day - 1]]);
  const [newStartTime, setNewStartTime] = useState<Date>(createDateWithTime(start));
  const [newEndTime, setNewEndTime] = useState<Date>(createDateWithTime(end));
  const [newLocation, setNewLocation] = useState<string>(location);
  const [newDescription, setNewDescription] = useState<string>(description);

  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLElement | null>(null);
  const [newColor, setNewColor] = useState<string>(color as string);

  const { createdEvents, setCreatedEvents } = useContext(CourseContext);
  const { isDarkMode, setErrorVisibility, setAutoVisibility, setAlertMsg } = useContext(AppContext);

  const handleOpenColorPicker = (event: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchorEl(event.currentTarget);
  };

  const handleCloseColorPicker = () => {
    setColorPickerAnchorEl(null);
  };

  const handleFormat = (newFormats: string[]) => {
    setNewDays(newFormats);
    setIsChanged(true);
  };

  /**
   * @param isChanged Indicates if an edit has been made to the start of the event
   * @param newStartTime The new edited start time
   * @param start The original starting time of the event
   * @returns The correct time to display on the time picker.
   * The newStartTime is only displayed if an edit has been made, otherwise the
   * original start time is shown.
   */
  const timePickerStart = (isChanged: boolean, newStartTime: Date, start: number) => {
    return isChanged ? newStartTime : createDateWithTime(start);
  };

  /**
   * @param isChanged Indicates if an edit has been made to the end of the event
   * @param newEndTime The new edited start time
   * @param end The original ending time of the event
   * @returns The correct time to display on the time picker.
   * The newEndTime is only displayed if an edit has been made, otherwise the
   * original end time is shown.
   */
  const timePickerEnd = (isChanged: boolean, newEndTime: Date, end: number) => {
    return isChanged ? newEndTime : createDateWithTime(end);
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

    setNewStartTime(createDateWithTime(eventTime.start));
    setNewEndTime(createDateWithTime(eventTime.end));
  };

  useEventDrag(updateEventTime);

  const handleUpdateEvent = (id: string) => {
    if (!areValidEventTimes(newStartTime, newEndTime)) {
      setAlertMsg('End time is earlier than start time');
      setErrorVisibility(true);
      return;
    }

    // For cloning events
    if (newDays.length > 1) {
      createEvents(id);
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

  const createEvents = (id: string) => {
    const updatedEventData = { ...createdEvents };
    // Delete the original event
    delete updatedEventData[id];

    // Create an event for each day that is selected in the dropdown option
    for (const day of newDays) {
      const newEvent = parseAndCreateEventObj(newName, newLocation, newDescription, newColor, day, newStartTime, newEndTime);
      updatedEventData[newEvent.event.id] = newEvent;
    }

    setCreatedEvents(updatedEventData);
    setIsEditing(false);
  };

  const handleDiscardChanges = () => {
    handleClose();
    setOpenSaveDialog(false);
    setIsEditing(false);
    setNewName(name);
    setNewLocation(location);
    setNewDescription(description);
    setNewDays([daysShort[day - 1]]);
    setNewColor(color.toString());
    setNewStartTime(createDateWithTime(start));
    setNewEndTime(createDateWithTime(end));
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
                value={timePickerStart(isChanged, newStartTime, start)}
                onChange={(e) => {
                  setIsChanged(true);
                  if (e) setNewStartTime(e);
                }}
              />
            </ListItem>
            <ListItem>
              <StyledListItemText primary="End time" />
              <TimePicker
                value={timePickerEnd(isChanged, newEndTime, end)}
                label={!areValidEventTimes(newStartTime, newEndTime) ? 'End time must be after start' : ''}
                slotProps={{ textField: { color: areValidEventTimes(newStartTime, newEndTime) ? 'primary' : 'error' } }}
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
                multiple={true}
                noOff
              />
            </ListItem>
            <ColorPicker
              color={newColor}
              setColor={setNewColor}
              colorPickerAnchorEl={colorPickerAnchorEl}
              handleOpenColorPicker={handleOpenColorPicker}
              handleCloseColorPicker={handleCloseColorPicker}
            />
          </StyledDialogContent>
          <ExecuteButton
            variant="contained"
            color="primary"
            onClick={() => handleUpdateEvent(eventPeriod.event.id)}
            disabled={newName === '' || newLocation === '' || newDays.length === 0}
          >
            <Save />
            SAVE
          </ExecuteButton>
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
                <StyledListItemIcon isDarkMode={isDarkMode}>
                  <Notes />
                </StyledListItemIcon>
                <Typography>{description}</Typography>
              </StyledListItem>
            )}
            <StyledListItem>
              <StyledListItemIcon isDarkMode={isDarkMode}>
                <LocationOn />
              </StyledListItemIcon>
              <Typography>{location}</Typography>
            </StyledListItem>
            <StyledListItem>
              <StyledListItemIcon isDarkMode={isDarkMode}>
                <AccessTime />
              </StyledListItemIcon>
              <Typography>
                {daysLong[day - 1]} {to24Hour(start)} {'\u2013'} {to24Hour(end)}
              </Typography>
            </StyledListItem>
            <StyledListItem>
              <ListItemIcon>
                <Link />
              </ListItemIcon>
              <TextField
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          navigator.clipboard.writeText(btoa(JSON.stringify(eventPeriod)));
                          setAutoVisibility(true);
                          setAlertMsg('Copied to clipboard!');
                        }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </InputAdornment>
                  ),
                  readOnly: true,
                }}
                size="small"
                value={btoa(JSON.stringify(eventPeriod))}
              />
            </StyledListItem>
          </StyledDialogContent>
        </>
      )}
    </Dialog>
  );
};

export default ExpandedEventView;
