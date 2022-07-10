import React, { useContext, useState } from 'react';
import { AccessTime, Close, Delete, Edit, Event, LocationOn, Notes, Save } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import { TimePicker } from '@mui/x-date-pickers';
import { Color, ColorPicker, ColorValue } from 'mui-color';
import { weekdaysLong, weekdaysShort } from '../../constants/timetable';
import { CourseContext } from '../../context/CourseContext';
import { EventTime } from '../../interfaces/Periods';
import { DropdownOptionProps, ExpandedEventViewProps } from '../../interfaces/PropTypes';
import { useEventDrag } from '../../utils/Drag';

const StyledDialogTitle = styled(DialogTitle)`
  padding: 8px 12px 8px 24px;
`;

const StyledTitleContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
  padding-bottom: 10px;
`;

const StyledDialogContent = styled(DialogContent)`
  padding-bottom: 20px;
`;

const StyledOptionToggle = styled(ToggleButtonGroup)`
  margin-top: 10px;
  width: 100%;
`;

const StyledOptionButtonToggle = styled(ToggleButton)`
  width: 100%;
  height: 32px;
  margin-bottom: 10px;
`;

const StyledDialogButtons = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  padding-bottom: 5px;
  padding-right: 5px;
`;

const DropdownOption: React.FC<DropdownOptionProps> = ({
  optionName,
  optionState,
  setOptionState,
  optionChoices,
  multiple,
  noOff,
}) => {
  const handleOptionChange = (event: React.MouseEvent<HTMLElement>, newOption: string | null) => {
    if (newOption !== null) {
      setOptionState(newOption);
    }
  };

  return (
    <ListItem key={optionName}>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <ListItemText primary={optionName} />
        </Grid>
        <Grid item xs={12}>
          <StyledOptionToggle
            size="small"
            exclusive={multiple ? false : true}
            value={optionState}
            onChange={handleOptionChange}
            aria-label="option choices"
          >
            {!noOff && (
              <StyledOptionButtonToggle value="off" aria-label="default">
                off
              </StyledOptionButtonToggle>
            )}
            {optionChoices.map((option) => (
              <StyledOptionButtonToggle key={option} value={option} aria-label={option}>
                {option}
              </StyledOptionButtonToggle>
            ))}
          </StyledOptionToggle>
        </Grid>
      </Grid>
    </ListItem>
  );
};

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
  const [newColor, setNewColor] = useState<ColorValue>(color as Color);

  const { createdEvents, setCreatedEvents } = useContext(CourseContext);

  const to24Hour = (n: number) => {
    let result = `${String((n / 1) >> 0)}:`;
    if ((n % 1) * 60) {
      if ((n % 1) * 60 < 10) {
        result += '0';
      }
      result += `${String(((n % 1) * 60) >> 0)}`;
    } else {
      result += '00';
    }
    return result;
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

  const handleDiscardChangesDialog = (id: string) => {
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
    <Dialog open={popupOpen} maxWidth="xs" onClose={handleCloseDialog}>
      <Dialog maxWidth="sm" open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
        <StyledTitleContainer>
          <StyledDialogContent>Discard unsaved changes?</StyledDialogContent>
        </StyledTitleContainer>
        <StyledDialogButtons>
          <Button
            onClick={() => {
              setOpenSaveDialog(false);
              setIsEditing(true);
            }}
          >
            Cancel
          </Button>
          <Button onClick={() => handleDiscardChangesDialog(eventPeriod.event.id)}>Discard</Button>
        </StyledDialogButtons>
      </Dialog>

      <StyledDialogTitle>
        <StyledTitleContainer>
          {isEditing ? <></> : <Box sx={{ paddingTop: 1 }}>{name}</Box>}

          <Box width="100%" display="flex" justifyContent="flex-end" alignItems="flex-end">
            {isEditing ? (
              <IconButton onClick={() => handleUpdateEvent(eventPeriod.event.id)} disabled={newName === '' || newLocation === ''}>
                <Save />
              </IconButton>
            ) : (
              <div> </div>
            )}

            <IconButton onClick={() => setIsEditing(true)} disabled={isEditing}>
              <Edit />
            </IconButton>

            <IconButton onClick={() => handleDeleteEvent(eventPeriod.event.id)}>
              <Delete />
            </IconButton>

            <IconButton aria-label="close" onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </StyledTitleContainer>
      </StyledDialogTitle>

      <StyledDialogContent>
        <Grid container direction="column" spacing={2}>
          {isEditing ? (
            <Grid item>
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
            </Grid>
          ) : (
            <></>
          )}

          <Grid item>
            {(String(description).length > 0 || isEditing) && (
              <Grid item container direction="column" spacing={2}>
                <Grid item>
                  {isEditing ? (
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
                  ) : (
                    <Grid item container direction="row" spacing={2}>
                      <Grid item>
                        <Notes />
                      </Grid>
                      <Grid item>
                        <Typography> {description}</Typography>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            )}
          </Grid>

          <Grid item container direction="column" spacing={2}>
            {isEditing ? (
              <Grid item>
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
              </Grid>
            ) : (
              <Grid item container direction="row" spacing={2}>
                <Grid item>
                  <LocationOn />
                </Grid>
                <Grid item>
                  <Typography> {location}</Typography>
                </Grid>
              </Grid>
            )}

            <Grid item container direction="row" spacing={2}>
              {isEditing ? (
                <Grid item>
                  <ListItem>
                    <ListItemText sx={{ alignSelf: 'center', paddingRight: 2 }} primary="Start time" />
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
                    <ListItemText sx={{ alignSelf: 'center', paddingRight: 2 }} primary="End time" />
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
                </Grid>
              ) : (
                <Grid item container direction="row" spacing={2}>
                  <Grid item>
                    <AccessTime />
                  </Grid>
                  <Grid item>
                    <Typography>
                      {weekdaysLong[day - 1]} {to24Hour(start)} {'\u2013'} {to24Hour(end)}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Grid>

            <Grid item container direction="row" spacing={2}>
              {isEditing ? (
                <ListItem>
                  <ListItemText sx={{ alignSelf: 'center', paddingLeft: 2, paddingRight: 2 }} primary="Color" />
                  <ColorPicker defaultValue="" value={newColor} onChange={(e) => setNewColor(e)} />
                </ListItem>
              ) : (
                <> </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </StyledDialogContent>
    </Dialog>
  );
};

export default ExpandedEventView;
