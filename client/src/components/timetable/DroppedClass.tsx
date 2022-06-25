import React, { useContext, useEffect, useRef, useState } from 'react';
import { OpenInFull } from '@mui/icons-material';
import { Button, Card, Grid } from '@mui/material';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { styled } from '@mui/system';

import { AppContext } from '../../context/AppContext';
import { ClassData, InInventory } from '../../interfaces/Course';
import { DroppedClassProps } from '../../interfaces/PropTypes';

import {
  CardData,
  defaultTransition,
  elevatedScale,
  getDefaultShadow,
  getElevatedShadow,
  isPeriod,
  registerCard,
  setDragTarget,
  timeToPosition,
  unregisterCard,
} from '../../utils/Drag';
import ExpandedView from './ExpandedView';
import PeriodMetadata from './PeriodMetadata';
import { getClassMargin, rowHeight } from './TimetableLayout';

export const inventoryMargin = 10; // Gap between inventory column and main timetable
export const borderWidth = 3;

const classTranslateX = (cardData: CardData, days?: string[], clashIndex?: number, width?: number, cellWidth?: number) => {
  // This cardData is for a scheduled class
  if (isPeriod(cardData) && clashIndex !== undefined && width && cellWidth) {
    const numClashing = 100 / width;

    // cellWidth + 1 is the length of the gap between two cells, and we shift by this length times the day of the week of the class to shift it into the right cell
    // cellWidth / numClashing gives the width of this card in px, so we shift it extra by its width times the index it's in in the clash group
    return `${(cellWidth + 1) * (cardData.time.day - 1) + clashIndex * (cellWidth / numClashing)}px`;
    // p.s. The reason we are hardcoding cellWidth in pixels is so that it doesn't do such a wonky transition when the width of the card gets changed reacting to cards being moved around
  }

  // This cardData is for an unscheduled class, i.e. it belongs in the inventory
  if (days) {
    // This shifts by the cards length times the number of days plus days.length + 1 to account for the amount of column borders (of length 1px) it must translate,
    // plus the margin seperating the days of the week from unscheduled section
    return `calc(${days.length * 100}% + ${days.length + 1 + inventoryMargin}px)`;
  }

  return 0;
};

const getHeightFactor = (cardData?: CardData | InInventory) =>
  cardData && isPeriod(cardData) ? cardData.time.end - cardData.time.start : 1;

export const classTranslateY = (cardData: CardData, earliestStartTime: number, y?: number) => {
  let result = 0;

  // The height of the card in hours relative to the default height of one (hour)
  const heightFactor = getHeightFactor(cardData);

  if (isPeriod(cardData)) {
    // This cardData is for a scheduled class
    // The number of rows to offset down
    const offsetRows = timeToPosition(cardData.time.start, earliestStartTime) - 2;

    // Calculate translation percentage (relative to height)
    result = offsetRows / heightFactor;
  } else if (y) {
    // This cardData is for an unscheduled class, i.e. it belongs in the inventory
    // Use the specified y-value
    result = y;
  }

  return `calc(${result * 100}% + ${result}px)`;
};

export const classTransformStyle = (
  cardData: CardData,
  earliestStartTime: number,
  days?: string[],
  y?: number,
  clashIndex?: number,
  width?: number,
  cellWidth: number = 0
) =>
  `translate(${classTranslateX(cardData, days, clashIndex, width, cellWidth)}, ${classTranslateY(
    cardData,
    earliestStartTime,
    y
  )})`;

export const getClassHeight = (cardData?: CardData | InInventory) => {
  // The height of the card in hours relative to the default height of one (hour)
  const heightFactor = getHeightFactor(cardData);

  return `${rowHeight * heightFactor + (heightFactor - 1)}px`;
};

export const transitionName = 'class';

const ExpandButton = styled(Button)`
  position: absolute;
  top: 3px;
  right: 3px;
  box-shadow: none;
  min-width: 0px;
  padding: 0;
  opacity: 40%;
  border-radius: 2px;
  color: #f5f5f5;

  &:hover {
    opacity: 100%;
  }
`;

const StyledCourseClass = styled('div', {
  shouldForwardProp: (prop) =>
    !['cardData', 'days', 'y', 'earliestStartTime', 'isSquareEdges', 'clashIndex', 'cardWidth', 'cellWidth'].includes(
      prop.toString()
    ),
})<{
  cardData: CardData;
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
  transform: ${({ cardData, earliestStartTime, days, y, clashIndex, cardWidth, cellWidth }) =>
    classTransformStyle(cardData, earliestStartTime, days, y, clashIndex, cardWidth, cellWidth)};
  width: ${({ cardWidth }) => cardWidth}%;
  height: ${({ cardData }) => getClassHeight(cardData)};
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

const StyledCourseClassInner = styled(Card, {
  shouldForwardProp: (prop) => !['backgroundColor', 'hasClash', 'clashColour'].includes(prop.toString()),
})<{
  backgroundColor: string;
  hasClash: boolean;
  clashColour: string;
}>`
  display: flex;
  flex-direction: column;
  background-color: ${({ backgroundColor }) => backgroundColor};
  color: white;
  font-size: 0.9rem;
  transition: ${defaultTransition}, z-index 0s;
  backface-visibility: hidden;
  outline: ${({ clashColour }) => `solid ${clashColour} ${borderWidth}px`};
  outline-offset: -${borderWidth}px;
  position: relative;
  height: 100%;
`;

const StyledClassName = styled('p')`
  width: 100%;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledClassInfo = styled(StyledClassName)`
  font-size: 85%;
`;

const DroppedClass: React.FC<DroppedClassProps> = ({
  cardData,
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
      setDragTarget(cardData, eventCopy);
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
      registerCard(cardData, elementCurrent);
    }

    return () => {
      if (elementCurrent) {
        unregisterCard(cardData, elementCurrent);
      }
    };
  });

  let activityMaxPeriods = 0;
  if (!isPeriod(cardData)) {
    activityMaxPeriods = Math.max(
      ...cardData.class.course.activities[cardData.class.activity].map((classData) => classData.periods.length)
    );
  }

  return (
    <>
      <StyledCourseClass
        ref={element}
        onMouseDown={onDown}
        onTouchStart={onDown}
        cardData={cardData}
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
          square={isSquareEdges}
          backgroundColor={color}
          hasClash={clashColour !== 'transparent'}
          clashColour={clashColour}
        >
          <Grid container sx={{ height: '100%' }} justifyContent="center" alignItems="center">
            <Grid item xs={11}>
              <StyledClassName>
                <b>
                  {cardData.class.course.code} {cardData.class.activity}
                </b>
              </StyledClassName>
              <StyledClassInfo>
                {isPeriod(cardData) ? (
                  isHideClassInfo ? (
                    <></>
                  ) : (
                    <PeriodMetadata period={cardData} />
                  )
                ) : (
                  <>
                    {activityMaxPeriods} class
                    {activityMaxPeriods !== 1 && 'es'}
                  </>
                )}
              </StyledClassInfo>
              <TouchRipple ref={rippleRef} />
            </Grid>
          </Grid>
          {isPeriod(cardData) && fullscreenVisible && (
            <ExpandButton onClick={() => setPopupOpen(true)}>
              <OpenInFull />
            </ExpandButton>
          )}
        </StyledCourseClassInner>
      </StyledCourseClass>
      {isPeriod(cardData) && <ExpandedView cardData={cardData} popupOpen={popupOpen} handleClose={handleClose} />}
    </>
  );
};

export default DroppedClass;
