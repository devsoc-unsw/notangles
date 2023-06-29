import React from 'react';
import { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Dialog, Typography, Card, Grid, CardProps } from '@mui/material';
import { styled } from '@mui/system';
import { StyledDialogContent, StyledDialogTitle, StyledTitleContainer } from '../styles/ExpandedViewStyles';
import { ExecuteButton, StyledListItemText } from '../styles/CustomEventStyles';
import { IconButton } from '@mui/material';
import { Close, Save, LocationOn } from '@mui/icons-material';
import { AppContext } from '../context/AppContext';
import { CourseContext } from '../context/CourseContext';
import { createEventObj } from '../utils/createEvent';

const PreviewCard = styled(Card)<CardProps & { bgColour: string }>`
  padding: 40px 20px;
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
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(true);
  const [link, setLink] = useState('');
  const [eventPreview, setEventPreview] = useState(false);
  const [event, setEvent] = useState({ name: '', location: '', color: '' });
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);
  const { setAlertMsg, setErrorVisibility, setDays, earliestStartTime, setEarliestStartTime, latestEndTime, setLatestEndTime } =
    useContext(AppContext);

  const updateDays = (day: number) => {
    if (day == 5 || day == 6) {
      const MondayToSunday: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      setDays((prev: string[]) => (prev.length > MondayToSunday.slice(day).length ? [...prev] : MondayToSunday.slice(day)));
    }
  };

  const createLinkEvent = (
    name: string,
    location: string,
    description: string,
    color: string,
    day: number,
    startTime: number,
    endTime: number
  ) => {
    // if duplicate event, return error
    if (
      Object.values(createdEvents).some((event) => event.event.name === name) &&
      Object.values(createdEvents).some((event) => event.time.day === day) &&
      Object.values(createdEvents).some((event) => event.time.start === startTime) &&
      Object.values(createdEvents).some((event) => event.time.end === endTime) &&
      Object.values(createdEvents).some((event) => event.event.location === location) &&
      Object.values(createdEvents).some((event) => event.event.description === description) &&
      Object.values(createdEvents).some((event) => event.event.color === color)
    ) {
      setAlertMsg('Event already exists');
      setErrorVisibility(true);
      return;
    }
    const newEvent = createEventObj(name, location, description, color, day, startTime, endTime);
    setCreatedEvents({
      ...createdEvents,
      [newEvent.event.id]: newEvent,
    });

    setEarliestStartTime(Math.min(Math.floor(earliestStartTime), Math.floor(startTime)));
    setLatestEndTime(Math.max(Math.ceil(latestEndTime), Math.ceil(endTime)));
    updateDays(day);
    return newEvent;
  };

  /**
   * Displays event preview if link is valid
   */
  const checkRender = (link: string) => {
    setLink(link);
    var isBase64 = require('is-base64');
    if (isBase64(link) && link.length > 0) {
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

  const saveToTimetable = () => {
    try {
      const linkEvent = JSON.parse(atob(link));
      const newEvent = createLinkEvent(
        linkEvent.event.name,
        linkEvent.event.location,
        linkEvent.event.description,
        linkEvent.event.color,
        linkEvent.time.day,
        linkEvent.time.start,
        linkEvent.time.end
      );
    } catch {
      setAlertMsg('Invalid event link');
      setErrorVisibility(true);
      return;
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setOpen(false);
    navigate('/');
  };

  return (
    <Dialog open={open} onClose={handleCloseModal}>
      <StyledDialogTitle>
        <Grid container justifyContent="flex-end" alignItems="center">
          <Typography id="modal-modal-title" variant="h6" component="h2" color="#616161">
            Add this event to your calendar?
          </Typography>
          <IconButton aria-label="close" onClick={handleCloseModal}>
            <Close />
          </IconButton>
        </Grid>
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
      <ExecuteButton variant="contained" color="primary" onClick={() => saveToTimetable()}>
        <Save />
        SAVE
      </ExecuteButton>
    </Dialog>
  );
};
export default EventShareModal;
