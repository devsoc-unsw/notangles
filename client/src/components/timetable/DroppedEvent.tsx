import React, { useContext, useEffect, useRef, useState } from 'react';
import { LocationOn, OpenInFull } from '@mui/icons-material';
import { Grid } from '@mui/material';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { styled } from '@mui/system';
import { AppContext } from '../../context/AppContext';
import { DroppedEventProps } from '../../interfaces/PropTypes';
import {
  ExpandButton,
  StyledCard,
  StyledCardInfo,
  StyledCardInner,
  StyledCardInnerGrid,
  StyledCardName,
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

  const { setInfoVisibility, isSquareEdges, days, earliestStartTime, setIsDrag } = useContext(AppContext);

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
      setDragTarget(eventPeriod, eventCopy, eventId);
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
              console.log(error);
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

  return (
    <>
      <StyledCard
        card={eventPeriod}
        days={days}
        earliestStartTime={earliestStartTime}
        isSquareEdges={isSquareEdges}
        cardWidth={cardWidth}
        clashIndex={clashIndex}
        cellWidth={cellWidth}
        ref={element}
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
          sx={{ backgroundColor: eventPeriod.event.color }}
        >
          <StyledCardInnerGrid container justifyContent="center" alignItems="center">
            <Grid item xs={11}>
              <StyledCardName>
                <b>{eventPeriod.event.name}</b>
              </StyledCardName>
              <StyledCardInfo>
                <StyledLocationIcon />
                {eventPeriod.event.location}
              </StyledCardInfo>
              <TouchRipple ref={rippleRef} />
            </Grid>
          </StyledCardInnerGrid>
          {fullscreenVisible && (
            <ExpandButton onClick={() => setPopupOpen(true)}>
              <OpenInFull />
            </ExpandButton>
          )}
        </StyledCardInner>
      </StyledCard>
      <ExpandedEventView eventPeriod={eventPeriod} popupOpen={popupOpen} handleClose={handleClose} />
    </>
  );
};

export default DroppedEvent;
