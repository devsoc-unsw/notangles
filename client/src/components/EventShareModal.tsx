import { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardProps, Dialog, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import { Add, Close, LocationOn } from '@mui/icons-material';
import { AppContext } from '../context/AppContext';
import { CourseContext } from '../context/CourseContext';
import { StyledDialogTitle, StyledTitleContainer } from '../styles/ControlStyles';
import { ExecuteButton, StyledListItemText } from '../styles/CustomEventStyles';
import { StyledCardName } from '../styles/DroppedCardStyles';
import { createEventObj } from '../utils/createEvent';
import { StyledTopIcons } from '../styles/ControlStyles';
import { resizeWeekArray } from '../utils/eventTimes';
import { StyledLocationIcon } from '../styles/CustomEventStyles';
import isBase64 from 'is-base64';

const PreviewCard = styled(Card)<CardProps & { bgColour: string }>`
  padding: 24px 16px;
  margin: 0 60px 25px 60px;
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

  const [open, setOpen] = useState(true);
  const [link, setLink] = useState('');
  const [showEventPreview, setShowEventPreview] = useState(false);
  const [event, setEvent] = useState({ name: '', location: '', color: '' });
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);
  const {
    setAlertMsg,
    setErrorVisibility,
    setDays,
    earliestStartTime,
    setEarliestStartTime,
    latestEndTime,
    setLatestEndTime,
  } = useContext(AppContext);

  useEffect(() => {
    if (encrypted) {
      checkRender(encrypted);
    }
  }, []);

  const createLinkEvent = (
    name: string,
    location: string,
    description: string,
    color: string,
    day: number,
    startTime: number,
    endTime: number,
  ) => {
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
    if (day == 5 || day == 6) {
      setDays((prev: string[]) => (prev.length > day ? [...prev] : resizeWeekArray(day)));
    }
    return newEvent;
  };

  /**
   * Displays event preview if link is valid
   */
  const checkRender = (link: string) => {
    setLink(link);

    if (isBase64(link) && link.length > 0) {
      try {
        const linkEvent = JSON.parse(atob(link));
        setShowEventPreview(true);
        setEvent({ name: linkEvent.event.name, location: linkEvent.event.location, color: linkEvent.event.color });
      } catch {
        setAlertMsg('Invalid event link');
        setErrorVisibility(true);
        setShowEventPreview(false);
        setEvent({ name: '', location: '', color: '' });
        navigate('/');
      }
    } else {
      setAlertMsg('Invalid event link');
      setErrorVisibility(true);
      setShowEventPreview(false);
      setEvent({ name: '', location: '', color: '' });
      navigate('/');
    }
  };

  const saveToTimetable = () => {
    try {
      const linkEvent = JSON.parse(atob(link));
      createLinkEvent(
        linkEvent.event.name,
        linkEvent.event.location,
        linkEvent.event.description,
        linkEvent.event.color,
        linkEvent.time.day,
        linkEvent.time.start,
        linkEvent.time.end,
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
      <StyledTopIcons>
        <IconButton aria-label="close" onClick={handleCloseModal}>
          <Close />
        </IconButton>
      </StyledTopIcons>
      <StyledDialogTitle>
        <StyledTitleContainer>Add this event to your calendar?</StyledTitleContainer>
      </StyledDialogTitle>
      {showEventPreview && (
        <PreviewCard bgColour={event.color}>
          <StyledListItemText>
            <StyledCardName>{event.name}</StyledCardName>
            {event.location && <StyledLocationIcon />}
            {event.location}
          </StyledListItemText>
        </PreviewCard>
      )}
      <ExecuteButton variant="contained" color="primary" onClick={() => saveToTimetable()}>
        <Add />
        Add
      </ExecuteButton>
    </Dialog>
  );
};
export default EventShareModal;

// { event.location && (
//   <StyledLocationIcon />
//   {event.location}
// )}
