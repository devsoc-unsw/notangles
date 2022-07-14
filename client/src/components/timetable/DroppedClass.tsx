import React, { useContext, useEffect, useRef, useState } from 'react';
import { OpenInFull } from '@mui/icons-material';
import { Grid } from '@mui/material';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { styled } from '@mui/system';

import { inventoryMargin } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import { ClassData, InInventory } from '../../interfaces/Periods';
import { DroppedClassProps } from '../../interfaces/PropTypes';
import {
  ClassCard,
  defaultTransition,
  elevatedScale,
  getDefaultShadow,
  getElevatedShadow,
  isScheduledPeriod,
  registerCard,
  setDragTarget,
  timeToPosition,
  unregisterCard
} from '../../utils/Drag';
import ExpandedView from './ExpandedClassView';
import PeriodMetadata from './PeriodMetadata';
import { ExpandButton, StyledCardInfo, StyledCardInner, StyledCardName } from '../../styles/DroppedCardStyles';
import { rowHeight } from './TimetableLayout';

const classTranslateX = (classCard: ClassCard, days?: string[], clashIndex?: number, width?: number, cellWidth?: number) => {
  // This classCard is for a scheduled class
  if (isScheduledPeriod(classCard) && clashIndex !== undefined && width && cellWidth) {
    const numClashing = 100 / width;

    // cellWidth + 1 is the length of the gap between two cells, and we shift by this length times the day of the week of the class to shift it into the right cell
    // cellWidth / numClashing gives the width of this card in px, so we shift it extra by its width times the index it's in in the clash group
    return `${(cellWidth + 1) * (classCard.time.day - 1) + clashIndex * (cellWidth / numClashing)}px`;
    // p.s. The reason we are hardcoding cellWidth in pixels is so that it doesn't do such a wonky transition when the width of the card gets changed reacting to cards being moved around
  }

  // This classCard is for an unscheduled class, i.e. it belongs in the inventory
  if (days) {
    // This shifts by the cards length times the number of days plus days.length + 1 to account for the amount of column borders (of length 1px) it must translate,
    // plus the margin seperating the days of the week from unscheduled section
    return `calc(${days.length * 100}% + ${days.length + 1 + inventoryMargin}px)`;
  }

  return 0;
};

const getHeightFactor = (classCard?: ClassCard | InInventory) =>
  classCard && isScheduledPeriod(classCard) ? classCard.time.end - classCard.time.start : 1;

export const classTranslateY = (classCard: ClassCard, earliestStartTime: number, y?: number) => {
  let result = 0;

  // The height of the card in hours relative to the default height of one (hour)
  const heightFactor = getHeightFactor(classCard);

  if (isScheduledPeriod(classCard)) {
    // This classCard is for a scheduled class
    // The number of rows to offset down
    const offsetRows = timeToPosition(classCard.time.start, earliestStartTime) - 2;

    // Calculate translation percentage (relative to height)
    result = offsetRows / heightFactor;
  } else if (y) {
    // This classCard is for an unscheduled class, i.e. it belongs in the inventory
    // Use the specified y-value
    result = y;
  }

  return `calc(${result * 100}% + ${result}px)`;
};

export const classTransformStyle = (
  classCard: ClassCard,
  earliestStartTime: number,
  days?: string[],
  y?: number,
  clashIndex?: number,
  width?: number,
  cellWidth: number = 0
) =>
  `translate(${classTranslateX(classCard, days, clashIndex, width, cellWidth)}, ${classTranslateY(
    classCard,
    earliestStartTime,
    y
  )})`;

export const getClassHeight = (classCard?: ClassCard | InInventory) => {
  // The height of the card in hours relative to the default height of one (hour)
  const heightFactor = getHeightFactor(classCard);

  return `${rowHeight * heightFactor + (heightFactor - 1)}px`;
};

export const transitionName = 'class';

const StyledCourseClass = styled('div', {
  shouldForwardProp: (prop) =>
    !['classCard', 'days', 'y', 'earliestStartTime', 'isSquareEdges', 'clashIndex', 'cardWidth', 'cellWidth'].includes(
      prop.toString()
    ),
})<{
  classCard: ClassCard;
  days: string[];
  y?: number;
  earliestStartTime: number;
  isSquareEdges: boolean;
  clashIndex: number;
  cardWidth: number;
  cellWidth: number;
}>`
  position: relative;
  grid-column: 2;
  grid-row: 2 / -1;
  transform: ${({ classCard, earliestStartTime, days, y, clashIndex, cardWidth, cellWidth }) =>
    classTransformStyle(classCard, earliestStartTime, days, y, clashIndex, cardWidth, cellWidth)};
  width: ${({ cardWidth }) => cardWidth}%;
  height: ${({ classCard }) => getClassHeight(classCard)};
  box-sizing: border-box;
  z-index: 100;
  cursor: grab;
  padding: 1px;
  transition: ${defaultTransition}, z-index 0s;

  /* uncomment me whoever decides to fix <CSSTransition>
  &.${transitionName}-enter {
    & > div {
      opacity: 0;
      transform: scale(${elevatedScale});
      box-shadow: ${({ isSquareEdges }) => getElevatedShadow(isSquareEdges)};
    }
  }

  &.${transitionName}-enter-active, &.${transitionName}-leave {
    & > div {
      opacity: 1;
      transform: scale(1);
      box-shadow: ${({ isSquareEdges }) => getDefaultShadow(isSquareEdges)};
    }
  }

  &.${transitionName}-leave-active {
    & > div {
      opacity: 0;
      box-shadow: ${({ isSquareEdges }) => getDefaultShadow(isSquareEdges)};
    }
  } */
`;

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
  earliestStartTime,
  handleSelectClass,
  cardWidth,
  clashIndex,
  clashColour,
  cellWidth: cellWidth,
}) => {
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);

  const { setInfoVisibility, isSquareEdges, isHideClassInfo, days, setIsDrag } = useContext(AppContext);

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
      <StyledCourseClass
        ref={element}
        onMouseDown={onDown}
        onTouchStart={onDown}
        classCard={classCard}
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
      </StyledCourseClass>
      {classCard.type === 'class' && <ExpandedView classPeriod={classCard} popupOpen={popupOpen} handleClose={handleClose} />}
    </>
  );
};

export default DroppedClass;
