import React from 'react';
import { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Dialog, Typography, Card, Grid, CardProps } from '@mui/material';
import { styled } from '@mui/system';
import { StyledDialogContent, StyledDialogTitle, StyledTitleContainer } from '../styles/ExpandedViewStyles';
import { ExecuteButton, StyledListItem, StyledListItemText } from '../styles/CustomEventStyles';
import { IconButton } from '@mui/material';
import { Close, Save, LocationOn } from '@mui/icons-material';
import { AppContext } from '../context/AppContext';
import { CourseContext } from '../context/CourseContext';
import { createEventObj, parseAndCreateEventObj } from '../utils/createEvent';
import { areValidEventTimes, createDateWithTime } from '../utils/eventTimes';

const PreviewCard = styled(Card)<CardProps & { bgColour: string }>`
  padding: 40px 20px;
  margin: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  align-items: center;
  background-color: ${(props) => (props.bgColour !== '' ? props.bgColour : '#1f7e8c')};
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  color: white;
`;

const StyledLocationOn = styled(LocationOn)`
  font-size: 12px;
`;

const EventShareModal = () => {
  let { encrypted } = useParams();

  const [open, setOpen] = React.useState(true);
  const handleClose = () => setOpen(false);

  const [eventPreview, setEventPreview] = useState(false);
  const [event, setEvent] = useState({ name: '', location: '', color: '' });
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);
  const { setAlertMsg, setErrorVisibility, setDays, earliestStartTime, setEarliestStartTime, latestEndTime, setLatestEndTime } =
    useContext(AppContext);

  const [eventName, setEventName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [startTime, setStartTime] = useState<Date>(createDateWithTime(9));
  const [endTime, setEndTime] = useState<Date>(createDateWithTime(10));
  const [eventDays, setEventDays] = useState<Array<string>>([]);
  const [link, setLink] = useState<string>('');
  const [color, setColor] = useState<string>('#1F7E8C');

  // const updateDays = (day: number) => {
  //   if (day == 5 || day == 6) {
  //     const MondayToSunday: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  //     setDays((prev: string[]) => (prev.length > MondayToSunday.slice(day).length ? [...prev] : MondayToSunday.slice(day)));
  //   }
  // };

  // const createLinkEvent = (
  //   name: string,
  //   location: string,
  //   description: string,
  //   color: string,
  //   day: number,
  //   startTime: number,
  //   endTime: number
  // ) => {
  //   const newEvent = createEventObj(name, location, description, color, day, startTime, endTime);
  //   setCreatedEvents({
  //     ...createdEvents,
  //     [newEvent.event.id]: newEvent,
  //   });

  //   setEarliestStartTime(Math.min(Math.floor(earliestStartTime), Math.floor(startTime)));
  //   setLatestEndTime(Math.max(Math.ceil(latestEndTime), Math.ceil(endTime)));

  //   updateDays(day);

  //   return newEvent;
  // };

  const checkRender = (link: string) => {
    setLink(link);

    var isBase64 = require('is-base64');
    if (isBase64(link) && link.length > 0) {
      console.log('isBase64');
      try {
        const linkEvent = JSON.parse(atob(link));
        setEventPreview(true);
        setEvent({ name: linkEvent.event.name, location: linkEvent.event.location, color: linkEvent.event.color });
      } catch {
        setAlertMsg('Invalid event link');
        setErrorVisibility(true);
        setEventPreview(false);
        setEvent({ name: '', location: '', color: '' });
      }
    }
  };

  React.useEffect(() => {
    if (encrypted) {
      checkRender(encrypted);
    }
  }, []);

  // const saveToTimetable = () => {
  //   console.log('saveToTimetable');
  //   try {
  //     const linkEvent = JSON.parse(atob(link));
  //     const newEvent = createLinkEvent(
  //       linkEvent.event.name,
  //       linkEvent.event.location,
  //       linkEvent.event.description,
  //       linkEvent.event.color,
  //       linkEvent.time.day,
  //       linkEvent.time.start,
  //       linkEvent.time.end
  //     );
  //     newEvents[newEvent.event.id] = newEvent;
  //   } catch {
  //     setAlertMsg('Invalid event link');
  //     setErrorVisibility(true);
  //     return;
  //   }
  // };

  return (
    <Dialog open={open} onClose={handleClose}>
      <StyledDialogTitle>
        <StyledTitleContainer>
          <Grid container justifyContent="flex-end" alignItems="center">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add this event to your calendar?
            </Typography>
            <IconButton aria-label="close" onClick={handleClose}>
              <Close />
            </IconButton>
          </Grid>
        </StyledTitleContainer>
      </StyledDialogTitle>
      <StyledDialogContent>
        {eventPreview && (
          <PreviewCard bgColour={event.color}>
            <StyledListItemText>
              <strong>{event.name}</strong>
              <br />
              <StyledLocationOn />
              {event.location}
            </StyledListItemText>
          </PreviewCard>
        )}
      </StyledDialogContent>
      <ExecuteButton variant="contained" color="primary">
        <Save />
        SAVE
      </ExecuteButton>
    </Dialog>
  );
};
export default EventShareModal;
