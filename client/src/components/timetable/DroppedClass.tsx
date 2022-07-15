import React, { useContext, useEffect, useRef, useState } from 'react';
import { OpenInFull } from '@mui/icons-material';
import { Grid } from '@mui/material';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { styled } from '@mui/system';

import { AppContext } from '../../context/AppContext';
import { ClassData } from '../../interfaces/Periods';
import { DroppedClassProps } from '../../interfaces/PropTypes';
import { ExpandButton, StyledCard, StyledCardInfo, StyledCardInner, StyledCardName } from '../../styles/DroppedCardStyles';
import { registerCard, setDragTarget, unregisterCard } from '../../utils/Drag';
import ExpandedView from './ExpandedClassView';
import PeriodMetadata from './PeriodMetadata';

const StyledCourseClassInner = styled(StyledCardInner, {
  shouldForwardProp: (prop) => prop !== 'backgroundColor',
})<{
  backgroundColor: string;
}>`
  background-color: ${({ backgroundColor }) => backgroundColor};
`;

const DroppedClass: React.FC<DroppedClassProps> = ({
  classCard,
  color,
  y,
  handleSelectClass,
  cardWidth,
  clashIndex,
  clashColour,
  cellWidth,
}) => {
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const { setInfoVisibility, isSquareEdges, isHideClassInfo, days, earliestStartTime, setIsDrag } = useContext(AppContext);

  const handleClose = (value: ClassData) => {
    handleSelectClass(value);
    setPopupOpen(!popupOpen);
  };

  const element = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<any>(null);

  let timer: number | null = null;
  let rippleStopped = false;
  let ignoreMouse = false;
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

    if ('start' in rippleRef.current) {
      rippleStopped = false;
      rippleRef.current.start(eventCopy);
    }

    const startDrag = () => {
      timer = null;
      setIsDrag(true);
      setDragTarget(classCard, eventCopy);
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
      registerCard(classCard, elementCurrent);
    }

    return () => {
      if (elementCurrent) {
        unregisterCard(classCard, elementCurrent);
      }
    };
  });

  let activityMaxPeriods = 0;
  if (classCard.type === 'inventory') {
    activityMaxPeriods = Math.max(
      ...classCard.class.course.activities[classCard.class.activity].map((classData) => classData.periods.length)
    );
  }

  return (
    <>
      <StyledCard
        ref={element}
        onMouseDown={onDown}
        onTouchStart={onDown}
        card={classCard}
        days={days}
        y={y}
        earliestStartTime={earliestStartTime}
        isSquareEdges={isSquareEdges}
        onMouseOver={() => {
          setFullscreenVisible(true);
        }}
        onMouseLeave={() => {
          setFullscreenVisible(false);
        }}
        clashIndex={clashIndex}
        cardWidth={cardWidth}
        cellWidth={cellWidth}
      >
        <StyledCourseClassInner
          isSquareEdges={isSquareEdges}
          backgroundColor={color}
          hasClash={clashColour !== 'transparent'}
          clashColour={clashColour}
        >
          <Grid container sx={{ height: '100%' }} justifyContent="center" alignItems="center">
            <Grid item xs={11}>
              <StyledCardName>
                <b>
                  {classCard.class.course.code} {classCard.class.activity}
                </b>
              </StyledCardName>
              <StyledCardInfo>
                {classCard.type === 'class' ? (
                  isHideClassInfo ? (
                    <></>
                  ) : (
                    <PeriodMetadata period={classCard} />
                  )
                ) : (
                  <>
                    {activityMaxPeriods} class
                    {activityMaxPeriods !== 1 && 'es'}
                  </>
                )}
              </StyledCardInfo>
              <TouchRipple ref={rippleRef} />
            </Grid>
          </Grid>
          {classCard.type === 'class' && fullscreenVisible && (
            <ExpandButton onClick={() => setPopupOpen(true)}>
              <OpenInFull />
            </ExpandButton>
          )}
        </StyledCourseClassInner>
      </StyledCard>
      {classCard.type === 'class' && <ExpandedView classPeriod={classCard} popupOpen={popupOpen} handleClose={handleClose} />}
    </>
  );
};

export default DroppedClass;
