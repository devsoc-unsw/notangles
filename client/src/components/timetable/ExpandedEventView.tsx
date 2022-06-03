import React, { useContext, useState } from 'react';
import { AccessTime, Close, Delete, LocationOn, Notes } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import { TimePicker } from '@mui/x-date-pickers';
import { ColorBox, ColorPicker, ColorValue } from 'mui-color';
import PaletteIcon from '@mui/icons-material/Palette';
import { CourseContext } from '../../context/CourseContext';
import { EventTime } from '../../interfaces/Course';
import { DropdownOptionProps } from '../../interfaces/PropTypes';
import { ExpandedEventViewProps } from '../../interfaces/PropTypes';
import { useEventDrag } from '../../utils/Drag_v2';

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
  padding-bottom: 20px;
`;

const StyledDialogContent = styled(DialogContent)`
  padding-bottom: 20px;
`;

const ExecuteButton = styled(Button)`
  width: 100%;
  border-radius: 0px 0px 5px 5px;
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

const ExpandedEventView: React.FC<ExpandedEventViewProps> = ({ eventData, popupOpen, handleClose }) => {
  const to24Hour = (n: number) => `${String((n / 1) >> 0)}:${String(n % 1)}0`;
  const weekdaysLong = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [openSaveDialog, setOpenSaveDialog] = useState<boolean>(false);

  const [newName, setNewName] = useState<string>(eventData.name);
  const weekdaysShort = ['Mo', 'Tu', 'We', 'Th', 'Fr'];
  const [newDays, setNewDays] = useState<Array<string>>([]);
  const [newStartTime, setNewStartTime] = useState<Date>(new Date(2022, 0, 0, eventData.time.start));
  const [newEndTime, setNewEndTime] = useState<Date>(new Date(2022, 0, 0, eventData.time.end));
  const [newLocation, setNewLocation] = useState<string>(eventData.location);
  const [newDescription, setNewDescription] = useState<string>(eventData.description);
  const [newColor, setNewColor] = useState<ColorValue>('#1f7e8c');

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
  };
  useEventDrag(updateEventTime);

  const handleUpdateEvent = (id: string) => {
    const newEventTime = {
      day: weekdaysShort.indexOf(newDays.toString()) + 1,
      start: newStartTime.getHours(),
      end: newEndTime.getHours(),
    };
    console.log(newEventTime);

    updateEventTime(newEventTime, id);

    setCreatedEvents({
      ...createdEvents,
      [id]: {
        ...createdEvents[id],
        name: newName,
        // TODO: select day
        time: newEventTime,

        location: newLocation,
        description: newDescription,
        // color: 'red',
        // TODO: input for color
      },
    });
    setIsEditing(false);
  };

  const handleDiscardChangesDialog = (id: string) => {
    handleClose();
    setOpenSaveDialog(false);
    setIsEditing(false);
    setNewName(eventData.name);
    setNewLocation(eventData.location);
    setNewDescription(eventData.description);
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

  return (
    <div>
      <Dialog PaperProps={{ sx: { minWidth: 600 } }} open={popupOpen} maxWidth="sm" onClose={handleCloseDialog}>
        <Dialog
          PaperProps={{ sx: { width: '35%', height: '20%' } }}
          open={openSaveDialog}
          onClose={() => setOpenSaveDialog(false)}
        >
          <StyledTitleContainer>
            <StyledDialogContent>Discard unsaved changes?</StyledDialogContent>
          </StyledTitleContainer>
          <Box display="flex" justifyContent="flex-end" alignItems="flex-end">
            <Button
              onClick={() => {
                setOpenSaveDialog(false);
                setIsEditing(true);
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => handleDiscardChangesDialog(eventData.id)}>Discard</Button>
          </Box>
        </Dialog>

        <StyledDialogTitle>
          <StyledTitleContainer>
            {/* Show input box when in edit mode */}
            {isEditing ? (
              <TextField
                variant="standard"
                required
                value={newName}
                onChange={(e) => {
                  setIsChanged(true);
                  setNewName(e.target.value);
                }}
              />
            ) : (
              <div>{eventData.name}</div>
            )}
            <Box>
              {isEditing ? (
                <Button onClick={() => handleUpdateEvent(eventData.id)} disabled={newName === '' || newLocation === ''}>
                  Save Changes
                </Button>
              ) : (
                <div></div>
              )}

              <IconButton onClick={() => setIsEditing(true)}>
                <EditIcon />
              </IconButton>

              <IconButton onClick={() => handleDeleteEvent(eventData.id)}>
                <Delete />
              </IconButton>

              <IconButton aria-label="close" onClick={handleCloseDialog}>
                <Close />
              </IconButton>
            </Box>
          </StyledTitleContainer>
        </StyledDialogTitle>

        {/* Make the dialog same size everytime */}
        <StyledDialogContent>
          <Grid container direction="column" spacing={2}>
            <Grid item container direction="row" spacing={2}>
              <Grid item>
                <AccessTime />
              </Grid>
              <Grid item>
                {/* How should we allow users to change time? Use time picker? */}
                {isEditing ? (
                  <>
                    <ListItem>
                      {/* TODO: Have the highlighted day as the current day of event */}
                      <DropdownOption
                        optionName="Days"
                        optionState={newDays}
                        setOptionState={handleFormat}
                        optionChoices={weekdaysShort}
                        noOff
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText sx={{ alignSelf: 'center', paddingLeft: 2, paddingRight: 2 }} primary="Start time" />
                      <TimePicker
                        views={['hours']}
                        value={newStartTime}
                        renderInput={(params) => <TextField {...params} />}
                        onChange={(e) => {
                          setIsChanged(true);
                          if (e) setNewStartTime(e);
                        }}
                      />

                      <ListItemText sx={{ alignSelf: 'center', paddingLeft: 2, paddingRight: 2 }} primary="End time" />
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
                  </>
                ) : (
                  <>
                    <Typography>
                      {weekdaysLong[eventData.time.day - 1]} {to24Hour(eventData.time.start)} {'\u2013'}{' '}
                      {to24Hour(eventData.time.end)}
                    </Typography>
                  </>
                )}
              </Grid>
            </Grid>

            {(String(eventData.description).length > 0 || isEditing) && (
              <Grid item container direction="row" spacing={2}>
                <Grid item>
                  <Notes />
                </Grid>
                <Grid item>
                  {isEditing ? (
                    <TextField
                      variant="standard"
                      value={newDescription}
                      multiline
                      onChange={(e) => {
                        setIsChanged(true);
                        setNewDescription(e.target.value);
                      }}
                    />
                  ) : (
                    <Typography style={{ wordWrap: 'break-word' }}>{eventData.description}</Typography>
                  )}
                </Grid>
              </Grid>
            )}

            <Grid item container direction="row" spacing={2}>
              <Grid item>
                <LocationOn />
              </Grid>
              <Grid item>
                {isEditing ? (
                  <TextField
                    required
                    variant="standard"
                    value={newLocation}
                    onChange={(e) => {
                      setIsChanged(true);
                      setNewLocation(e.target.value);
                    }}
                  />
                ) : (
                  <Typography> {eventData.location}</Typography>
                )}
              </Grid>
            </Grid>

            <Grid item container direction="row" spacing={2}>
              {isEditing ? (
                <Grid item>
                  {/* TODO: ColorPicker breaks everything rn */}
                  {/* <ColorPicker defaultValue="" value={newColor} onChange={(e) => setNewColor(e)} /> */}
                </Grid>
              ) : (
                <Grid
                  item
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    paddingLeft: '10px',
                    paddingRight: '10px',
                  }}
                >
                  <Box bgcolor={`${newColor}`} sx={{ width: 25, height: 25, borderRadius: '5px' }}></Box>
                  <Typography sx={{ paddingLeft: '15px' }}>Current color is {newColor}</Typography>
                </Grid>
              )}
            </Grid>
          </Grid>
        </StyledDialogContent>
      </Dialog>
    </div>
  );
};

export default ExpandedEventView;
