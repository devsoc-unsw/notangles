import {
  AccessTime,
  Close,
  ContentCopy,
  Delete,
  Edit,
  Event,
  Link,
  LocationOn,
  Notes,
  Save,
} from '@mui/icons-material';
import {
  CircularProgress,
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
import { styled } from '@mui/material/styles';
import { TimePicker } from '@mui/x-date-pickers';
import { useState } from 'react';

import {
  useDeleteTimetableEvent,
  useSaveTimetableEvent,
  useUpdateTimetableEvent,
} from '../../../api/timetable/mutations';
import { useGetUserSettingsQuery } from '../../../api/user/queries';
import { daysLong, daysShort } from '../../../constants/timetable';
import { EventCard } from '../../../interfaces/Timetable';
import {
  StyledDialogContent,
  StyledDialogTitle,
  StyledListItem,
  StyledTitleContainer,
  StyledTopIcons,
} from '../../../styles/ControlStyles';
import { ExecuteButton, StyledListItemText } from '../../../styles/CustomEventStyles';
import { ColorDivider } from '../../../styles/ExpandedViewStyles';
import { decodeColor } from '../../../utils/colors';
import { generateHour } from '../../../utils/time';
import StyledDialog from '../../StyledDialog';
import ColorPicker from '../controls/ColorPicker';
import DropdownOption from './DropdownOption';

const StyledListItemIcon = styled(ListItemIcon, { shouldForwardProp: (prop) => prop !== 'isDarkMode' })<
  ListItemIconProps & { isDarkMode: boolean }
>`
  color: ${(props) => (props.isDarkMode ? '#FFFFFF' : '#212121')};
`;

const StyledEventLink = styled(TextField)`
  flex-grow: 1;
`;

const ExpandedEventView: React.FC<{
  event: EventCard;
  timetableId: string;
  popupOpen: boolean;
  handleClose: () => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}> = ({ event, timetableId, popupOpen, handleClose, isEditing, setIsEditing }) => {
  const { isDarkMode, preferredTheme } = useGetUserSettingsQuery();
  const eventSaveMutation = useSaveTimetableEvent();
  const eventUpdateMutation = useUpdateTimetableEvent();
  const eventDeleteMutation = useDeleteTimetableEvent();
  const isSaving = eventSaveMutation.isPending || eventUpdateMutation.isPending;
  const isBusy = isSaving || eventDeleteMutation.isPending;

  // Editing state
  const [eventName, setEventName] = useState<string>(event.name);
  const [eventDescription, setEventDescription] = useState<string>(event.description ?? '');
  const [eventLocation, setEventLocation] = useState<string>(event.location ?? '');
  const [startTime, setStartTime] = useState<Date>(
    new Date(0, 0, 0, Math.floor(event.time.start / 60), event.time.start % 60),
  );
  const [endTime, setEndTime] = useState<Date>(new Date(0, 0, 0, Math.floor(event.time.end / 60), event.time.end % 60));
  const [eventDays, setEventDays] = useState<string[]>([daysShort[event.time.day]]);
  const [color, setColor] = useState<string>(event.color);
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLElement | null>(null);
  const [openDiscardDialog, setOpenDiscardDialog] = useState(false);

  const startMins = startTime.getHours() * 60 + startTime.getMinutes();
  const endMins = endTime.getHours() * 60 + endTime.getMinutes() || 24 * 60;
  const isChanged =
    eventName !== event.name ||
    eventDescription !== (event.description ?? '') ||
    eventLocation !== (event.location ?? '') ||
    Number.isNaN(startTime.getTime()) ||
    Number.isNaN(endTime.getTime()) ||
    startMins !== event.time.start ||
    endMins !== event.time.end ||
    eventDays.length !== 1 ||
    eventDays[0] !== daysShort[event.time.day] ||
    color !== event.color;
  const validTimes = !Number.isNaN(startTime.getTime()) && !Number.isNaN(endTime.getTime()) && startMins < endMins;
  const validColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color) || /^default-[1-8]$/.test(color);
  const saveDisabled = !eventName.trim() || !eventDays.length || !validTimes || !validColor || isSaving;

  const handleOpenColorPicker = (event: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchorEl(event.currentTarget);
  };

  const handleCloseColorPicker = () => {
    setColorPickerAnchorEl(null);
  };

  const closeDialog = () => {
    setOpenDiscardDialog(false);
    setColorPickerAnchorEl(null);
    setIsEditing(false);
    handleClose();
  };

  const handleCloseDialog = () => {
    if (isBusy || openDiscardDialog) return;
    if (isEditing ? isChanged : event.eventType === 'TUTORING' && color !== event.color) {
      setOpenDiscardDialog(true);
    } else {
      closeDialog();
    }
  };

  const handleSaveEvent = () => {
    if (saveDisabled) return;
    const days = eventDays.map((day) => daysShort.indexOf(day));
    const primaryDay = days.includes(event.time.day) ? event.time.day : days[0];
    eventSaveMutation.mutate(
      {
        timetableId,
        eventType: event.eventType,
        additionalDays: days.filter((day) => day !== primaryDay),
        event: {
          eventId: event.eventId,
          colour: color,
          dayOfWeek: primaryDay,
          start: startMins,
          end: endMins,
          title: eventName.trim(),
          description: eventDescription,
          location: eventLocation,
        },
      },
      {
        onSuccess: () => {
          setEventDays([daysShort[primaryDay]]);
          setIsEditing(false);
        },
      },
    );
  };

  const handleDeleteEvent = () => {
    eventDeleteMutation.mutate({ timetableId, eventId: event.eventId }, { onSuccess: closeDialog });
  };

  const handleSaveColor = () => {
    if (!validColor || eventUpdateMutation.isPending) return;
    eventUpdateMutation.mutate(
      {
        eventId: event.eventId,
        colour: color,
        dayOfWeek: event.time.day,
        start: event.time.start,
        end: event.time.end,
        title: event.name,
        description: event.description,
        location: event.location,
      },
      {
        onSuccess: () => {
          setColorPickerAnchorEl(null);
        },
      },
    );
  };

  const urlEvent = {
    name: event.name,
    location: event.location,
    color: decodeColor(event.color, preferredTheme),
    description: event.description,
    time: event.time,
  };
  const url = window.location.href + 'event/' + btoa(JSON.stringify(urlEvent));

  return (
    <Dialog open={popupOpen} maxWidth="sm" onClose={handleCloseDialog}>
      <StyledDialog
        open={openDiscardDialog}
        onClose={() => {
          setOpenDiscardDialog(false);
        }}
        onConfirm={closeDialog}
        title="Discard unsaved changes?"
        content="Your changes will be lost."
        confirmButtonText="Discard"
      />
      {isEditing ? (
        <>
          <StyledTopIcons>
            <Grid
              container
              sx={{
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <IconButton aria-label="close" onClick={handleCloseDialog} disabled={isBusy}>
                <Close />
              </IconButton>
            </Grid>
          </StyledTopIcons>
          <StyledDialogContent>
            <ListItem>
              <ListItemIcon>
                <Event />
              </ListItemIcon>
              <TextField
                id="outlined-required"
                label="Event Name"
                value={eventName}
                onChange={(e) => {
                  setEventName(e.target.value);
                }}
                variant="outlined"
                fullWidth
                required
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Notes />
              </ListItemIcon>
              <TextField
                id="outlined-basic"
                label="Description (optional)"
                value={eventDescription}
                onChange={(e) => {
                  setEventDescription(e.target.value);
                }}
                variant="outlined"
                multiline
                fullWidth
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LocationOn />
              </ListItemIcon>
              <TextField
                id="outlined-basic"
                label="Location (optional)"
                value={eventLocation}
                onChange={(e) => {
                  setEventLocation(e.target.value);
                }}
                variant="outlined"
                fullWidth
              />
            </ListItem>
            <ListItem>
              <StyledListItemText primary="Start time" />
              <TimePicker
                // Displays time as the time of the grid the user pressed
                // when popover has just been opened
                value={startTime}
                onChange={(e) => {
                  if (e) setStartTime(e);
                }}
              />
            </ListItem>
            <ListItem>
              <StyledListItemText primary="End time" />
              <TimePicker
                value={endTime}
                label={!validTimes ? 'End time must be after start' : ''}
                slotProps={{ textField: { color: validTimes ? 'primary' : 'error' } }}
                onChange={(e) => {
                  if (e) setEndTime(e);
                }}
              />
            </ListItem>
            <ListItem disablePadding={true}>
              <DropdownOption
                optionName="Days"
                optionState={eventDays}
                setOptionState={(newDays: string[]) => {
                  setEventDays(newDays);
                }}
                optionChoices={daysShort}
                multiple={true}
                noOff
              />
            </ListItem>
            <ColorPicker
              color={color}
              setColor={setColor}
              colorPickerAnchorEl={colorPickerAnchorEl}
              handleOpenColorPicker={handleOpenColorPicker}
              handleCloseColorPicker={handleCloseColorPicker}
            />
          </StyledDialogContent>
          <ExecuteButton variant="contained" color="primary" onClick={handleSaveEvent} disabled={saveDisabled}>
            {isSaving ? <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> : <Save />}
            {isSaving ? 'Saving...' : 'SAVE'}
          </ExecuteButton>
        </>
      ) : (
        <>
          <StyledTopIcons>
            {event.eventType !== 'TUTORING' && (
              <IconButton
                aria-label="edit"
                onClick={() => {
                  setIsEditing(true);
                }}
                disabled={isEditing}
              >
                <Edit />
              </IconButton>
            )}
            <IconButton aria-label="delete" onClick={handleDeleteEvent} disabled={isBusy}>
              <Delete />
            </IconButton>
            <IconButton aria-label="close" onClick={handleCloseDialog} disabled={isBusy}>
              <Close />
            </IconButton>
          </StyledTopIcons>
          <StyledDialogTitle>
            <StyledTitleContainer>{event.name}</StyledTitleContainer>
          </StyledDialogTitle>
          <StyledDialogContent>
            {!!event.description?.trim() && (
              <StyledListItem>
                <StyledListItemIcon isDarkMode={isDarkMode}>
                  <Notes />
                </StyledListItemIcon>
                <Typography>{event.description}</Typography>
              </StyledListItem>
            )}
            {event.location?.trim() && (
              <StyledListItem>
                <StyledListItemIcon isDarkMode={isDarkMode}>
                  <LocationOn />
                </StyledListItemIcon>
                <Typography>{event.location}</Typography>
              </StyledListItem>
            )}
            <StyledListItem>
              <StyledListItemIcon isDarkMode={isDarkMode}>
                <AccessTime />
              </StyledListItemIcon>
              <Typography>
                {daysLong[event.time.day]} {generateHour(event.time.start / 60, false)} {'\u2013'}{' '}
                {generateHour(event.time.end / 60, false)}
              </Typography>
            </StyledListItem>
            {event.eventType !== 'TUTORING' ? (
              <StyledListItem>
                <StyledListItemIcon isDarkMode={isDarkMode}>
                  <Link />
                </StyledListItemIcon>
                <StyledEventLink
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => {
                              void navigator.clipboard.writeText(url);
                            }}
                          >
                            <ContentCopy />
                          </IconButton>
                        </InputAdornment>
                      ),
                      readOnly: true,
                    },
                  }}
                  size="small"
                  value={url}
                />
              </StyledListItem>
            ) : (
              <>
                <ColorDivider />
                <StyledListItem>
                  <ColorPicker
                    color={color}
                    setColor={setColor}
                    colorPickerAnchorEl={colorPickerAnchorEl}
                    handleOpenColorPicker={handleOpenColorPicker}
                    handleCloseColorPicker={handleCloseColorPicker}
                    handleSaveNewColor={handleSaveColor}
                    saveDisabled={!validColor || eventUpdateMutation.isPending}
                    saveLoading={eventUpdateMutation.isPending}
                  />
                </StyledListItem>
              </>
            )}
          </StyledDialogContent>
        </>
      )}
    </Dialog>
  );
};

export default ExpandedEventView;
