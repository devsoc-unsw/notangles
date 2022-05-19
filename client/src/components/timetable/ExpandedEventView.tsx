import React, { useContext } from 'react';
import { AccessTime, Close, Delete, LocationOn, Notes } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle, Grid,
  IconButton, Typography
} from '@mui/material';
import { styled } from '@mui/system';
import { CourseContext } from '../../context/CourseContext';
import {
  EventTime
} from '../../interfaces/Course';
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

const ExpandedEventView: React.FC<ExpandedEventViewProps> = ({ eventData, popupOpen, handleClose }) => {
  const to24Hour = (n: number) => `${String((n / 1) >> 0)}:${String(n % 1)}0`;
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);

  const updateEventTime = (eventTime: EventTime, eventName: string) => {
    setCreatedEvents({
      ...createdEvents,
      [eventName]: {
        ...createdEvents[eventName],
        time: { ...eventTime },
      },
    });
  };
  useEventDrag(updateEventTime);

  const handleDeleteEvent = (eventName: string) => {
    const updatedEventData = { ...createdEvents };
    delete updatedEventData[eventName];
    setCreatedEvents(updatedEventData);
  };

  return (
    <div>
      <Dialog PaperProps={{ sx: { width: '50%', height: '35%' } }} open={popupOpen} maxWidth="sm" onClose={handleClose}>
        <StyledDialogTitle>
          <StyledTitleContainer>
            {eventData.name}
            <IconButton aria-label="close" onClick={handleClose}>
              <Close />
            </IconButton>
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
                <Typography>
                  {weekdays[eventData.time.day - 1]} {to24Hour(eventData.time.start)} {'\u2013'} {to24Hour(eventData.time.end)}
                </Typography>
              </Grid>
            </Grid>

            <Grid item container direction="row" spacing={2}>
              <Grid item>
                <Notes />
              </Grid>
              <Grid item>
                <Typography style={{ wordWrap: 'break-word' }}>{eventData.description}</Typography>
              </Grid>
            </Grid>

            <Grid item container direction="row" spacing={2}>
              <Grid item>
                <LocationOn />
              </Grid>
              <Grid item>
                <Typography> {eventData.location}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </StyledDialogContent>
        <ExecuteButton
          variant="contained"
          color="primary"
          disableElevation
          onClick={() => handleDeleteEvent(eventData.id)} //handleRemoveEvent when I can get it working
        >
          <Delete sx={{ alignSelf: 'center' }} />
          DELETE
        </ExecuteButton>
      </Dialog>
    </div>
  );
};

export default ExpandedEventView;
