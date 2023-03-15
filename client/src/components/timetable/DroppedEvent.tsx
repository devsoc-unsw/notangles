import React, { useContext, useEffect, useRef, useState } from 'react';
import { LocationOn, MoreHoriz } from '@mui/icons-material';
import { Grid } from '@mui/material';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { styled } from '@mui/system';
import { unknownErrorMessage } from '../../constants/timetable';
import { CourseContext } from '../../context/CourseContext';
import { createNewEvent } from '../../utils/createEvent';
import { AppContext } from '../../context/AppContext';
import { DroppedEventProps } from '../../interfaces/PropTypes';
import {
  ExpandButton,
  StyledCard,
  StyledCardInfo,
  StyledCardInner,
  StyledCardInnerGrid,
  StyledCardName,
  DuplicateButton,
} from '../../styles/DroppedCardStyles';
import { registerCard, setDragTarget, unregisterCard } from '../../utils/Drag';
import ExpandedEventView from './ExpandedEventView';

const StyledLocationIcon = styled(LocationOn)`
  vertical-align: text-bottom;
  font-size: inherit;
  padding-bottom: 0.1em;
`;

const DroppedEvent: React.FC<DroppedEventProps> = ({ eventId, eventPeriod, cardWidth, clashIndex, cellWidth }) => {
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  
  // For duplicating events
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);

  const { earliestStartTime, days, isSquareEdges, setIsDrag, setAlertMsg, setInfoVisibility, setErrorVisibility } =
    useContext(AppContext);

  const element = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<any>(null);

  let timer: number | null = null;
  let rippleStopped = false;
  let ignoreMouse = false;

  const handleClose = () => {
    setPopupOpen(!popupOpen);
  };

  const onDown = (eventDown: any) => {
    if (
      eventDown.target.className?.baseVal?.includes('MuiSvgIcon-root') ||
      eventDown.target.parentElement?.className?.baseVal?.includes('MuiSvgIcon-root')
    )
      return;

    if (!('type' in eventDown)) return;
    if (eventDown.type.includes('mouse') && ignoreMouse) return;
    if (eventDown.type.includes('touch')) ignoreMouse = true;

    const eventCopy = { ...eventDown };

    if (rippleRef.current && 'start' in rippleRef.current) {
      rippleStopped = false;
      rippleRef.current.start(eventCopy);
    }

    const startDrag = () => {
      timer = null;
      setIsDrag(true);
      setDragTarget(eventPeriod, null, eventCopy, eventId);
      setInfoVisibility(false);
    };

    if (eventDown.type.includes('touch')) {
      timer = window.setTimeout(startDrag, 500);
    } else {
      startDrag();
    }

    const onUp = (eventUp: any) => {
      if (eventUp.type.includes('mouse') && ignoreMouse) return;

      window.removeEventListener('mousemove', onUp);
      window.removeEventListener('touchmove', onUp);

      if ((timer || !eventUp.type.includes('move')) && rippleRef.current && 'stop' in rippleRef.current) {
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchend', onUp);

        if (!rippleStopped && 'stop' in rippleRef.current) {
          rippleStopped = true;

          setTimeout(() => {
            try {
              rippleRef.current.stop(eventUp);
            } catch (error) {
              setAlertMsg(unknownErrorMessage);
              setErrorVisibility(true);
            }
          }, 100);
        }
      }

      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
        setInfoVisibility(true);
      }

      eventUp.preventDefault();
    };

    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp, { passive: false });
    window.addEventListener('mousemove', onUp);
    window.addEventListener('touchmove', onUp, { passive: false });
  };

  useEffect(() => {
    const elementCurrent = element.current;

    if (elementCurrent) {
      registerCard(eventPeriod, elementCurrent);
    }

    return () => {
      if (elementCurrent) {
        unregisterCard(eventPeriod, elementCurrent);
      }
    };
  });

  const isLessThanOneHour = eventPeriod.time.end - eventPeriod.time.start < 1;

  const duplicateEvent = () => {
    const MondayToSaturday: string[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    // Get event details
    for (const event in createdEvents) {
        if (createdEvents[event].event.id === eventId) {
            var tempEvent = createdEvents[event]

            const eventStart = new Date(0)
            eventStart.setHours(tempEvent.time.start)
            eventStart.setMinutes((tempEvent.time.start % 1)*60)
            const eventEnd = new Date(0)
            eventEnd.setHours(tempEvent.time.end) 
            eventEnd.setMinutes((tempEvent.time.end % 1)*60)
            
            // Create new event
            const newEvent = createNewEvent(tempEvent.event.name, 
                tempEvent.event.location, 
                tempEvent.event.description, 
                tempEvent.event.color, 
                MondayToSaturday[tempEvent.time.day - 1], 
                eventStart, 
                eventEnd);
            setCreatedEvents({...createdEvents, [newEvent.event.id]: newEvent});
            break
        }
    }
  }

  return (
    <>
      <StyledCard
        card={eventPeriod}
        nDays={days.length}
        earliestStartTime={earliestStartTime}
        isSquareEdges={isSquareEdges}
        cardWidth={cardWidth}
        clashIndex={clashIndex}
        cellWidth={cellWidth}
        ref={element}
        onTouchStart={() => {
          setFullscreenVisible(true);
        }}
        onMouseDown={onDown}
        onMouseOver={() => {
          setFullscreenVisible(true);
        }}
        onMouseLeave={() => {
          setFullscreenVisible(false);
        }}
      >
        <StyledCardInner
          hasClash={false}
          isSquareEdges={isSquareEdges}
          clashColour={'none'}
          backgroundColour={eventPeriod.event.color.toString()}
        >
          <StyledCardInnerGrid container justifyContent="center" alignItems="center">
            <Grid item xs={11}>
              <StyledCardName>{eventPeriod.event.name}</StyledCardName>
              {/* only display location on card if event not less than one hour */}
              {!isLessThanOneHour && (
                <StyledCardInfo>
                  <StyledLocationIcon />
                  {eventPeriod.event.location}
                </StyledCardInfo>
              )}
              <TouchRipple ref={rippleRef} />
            </Grid>
          </StyledCardInnerGrid>
          {fullscreenVisible && (
            <ExpandButton onClick={() => setPopupOpen(true)}>
              <MoreHoriz fontSize="large" />
            </ExpandButton>
          )}
          {fullscreenVisible && <DuplicateButton onClick={duplicateEvent} />}
        </StyledCardInner>
      </StyledCard>
      <ExpandedEventView eventPeriod={eventPeriod} popupOpen={popupOpen} handleClose={handleClose} />
    </>
  );
};

export default DroppedEvent;
