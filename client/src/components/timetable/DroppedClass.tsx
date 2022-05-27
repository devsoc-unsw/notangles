import React, { useContext, useEffect, useRef, useState } from 'react';
import { LocationOn, OpenInFull, PeopleAlt, Warning } from '@mui/icons-material';
import { Button, Card, Grid } from '@mui/material';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { yellow } from '@mui/material/colors';
import { styled } from '@mui/system';

import { AppContext } from '../../context/AppContext';
import { ClassData, InInventory } from '../../interfaces/Course';
import { DroppedClassProps, PeriodMetadataProps } from '../../interfaces/PropTypes';

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
import { getClassMargin, rowHeight } from './TimetableLayout';

export const inventoryMargin = 10;

const borderWidth = 3;

const classTranslateX = (cardData: CardData, days?: string[], clashIndex?: number, width?: number) => {
  if (isPeriod(cardData) && clashIndex !== undefined && width) {
    return `${(cardData.time.day - 1) * 100 + clashIndex * width}%`;
  }
  // not a period, so in the inventory
  if (days) {
    // `1 / devicePixelRatio` refers to the width of a timetable border
    return `calc(${days.length * 100}% + ${inventoryMargin + 1 / devicePixelRatio}px)`;
  }

  return 0;
};

const getHeightFactor = (cardData?: CardData | InInventory) =>
  cardData && isPeriod(cardData) ? cardData.time.end - cardData.time.start : 1;

export const classTranslateY = (cardData: CardData, earliestStartTime: number, y?: number) => {
  let result = 0;
  // height compared to standard row height
  const heightFactor = getHeightFactor(cardData);

  if (isPeriod(cardData)) {
    // number of rows to offset down
    const offsetRows = timeToPosition(cardData.time.start, earliestStartTime) - 2;
    // calculate translate percentage (relative to height)
    result = offsetRows / heightFactor;
  } else if (y) {
    // not a period, so in the inventory
    result = y;
  }

  return `calc(${result * 100}% + ${result / devicePixelRatio}px)`;
};

export const classHeight = (cardData?: CardData | InInventory) => {
  // height compared to standard row height
  const heightFactor = getHeightFactor(cardData);

  return `${rowHeight * heightFactor + (heightFactor - 1) / devicePixelRatio}px`;
};

export const classTransformStyle = (
  cardData: CardData,
  earliestStartTime: number,
  days?: string[],
  y?: number,
  clashIndex?: number,
  width?: number
) => `translate(${classTranslateX(cardData, days, clashIndex, width)}, ${classTranslateY(cardData, earliestStartTime, y)})`;

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
    !['cardData', 'days', 'y', 'earliestStartTime', 'isSquareEdges', 'clashIndex', 'width'].includes(prop.toString()),
})<{
  cardData: CardData;
  days: string[];
  y?: number;
  earliestStartTime: number;
  isSquareEdges: boolean;
  clashIndex: number;
  width: number;
}>`
  position: relative;
  grid-column: 2;
  grid-row: 2 / -1;
  transform: ${({ cardData, earliestStartTime, days, y, clashIndex, width }) =>
    classTransformStyle(cardData, earliestStartTime, days, y, clashIndex, width)};
  // position over timetable borders
  width: calc(100% + ${1 / devicePixelRatio}px);
  height: ${({ cardData }) => classHeight(cardData)};
  box-sizing: border-box;
  z-index: 100;
  cursor: grab;
  padding: ${({ isSquareEdges }) => getClassMargin(isSquareEdges)}px;
  padding-right: ${({ isSquareEdges }) => getClassMargin(isSquareEdges) + 1 / devicePixelRatio}px;
  padding-bottom: ${({ isSquareEdges }) => getClassMargin(isSquareEdges) + (isSquareEdges ? 0 : 1 / devicePixelRatio)}px;

  transition: ${defaultTransition}, z-index 0s;

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
  }
`;

const StyledCourseClassInner = styled(Card, {
  shouldForwardProp: (prop) =>
    !['backgroundColor', 'hasClash', 'isSquareEdges', 'cardWidth', 'clashColour'].includes(prop.toString()),
})<{
  backgroundColor: string;
  hasClash: boolean;
  isSquareEdges: boolean;
  cardWidth: number;
  clashColour: string;
}>`
  display: flex;
  flex-direction: column;
  background-color: ${({ backgroundColor }) => backgroundColor};
  color: white;
  font-size: 0.9rem;
  border-radius: ${({ isSquareEdges }) => (isSquareEdges ? '0px' : '7px')};
  transition: ${defaultTransition}, z-index 0s;
  backface-visibility: hidden;
  outline: ${({ hasClash, clashColour }) => (hasClash ? clashColour : 'solid transparent 0px')};
  outline-offset: -${borderWidth}px;
  width: ${({ cardWidth }) => cardWidth}%;
  height: 100%;
  position: relative;
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

const StyledLocationIcon = styled(LocationOn)`
  vertical-align: top;
  font-size: inherit;
`;

const StyledPeopleIcon = styled(PeopleAlt)`
  vertical-align: top;
  font-size: inherit;
  margin-right: 0.2rem;
`;

const StyledWarningIcon = styled(Warning)`
  vertical-align: top;
  font-size: inherit;
  margin-right: 0.2rem;
  color: ${yellow[400]};
`;

const StyledCapacityIndicator = styled('span', {
  shouldForwardProp: (prop) => prop !== 'percentEnrolled',
})<{
  percentEnrolled: number;
}>`
  text-overflow: ellipsis;
  margin: 0;
  font-weight: ${({ percentEnrolled }) => (percentEnrolled === 1 ? 'bolder' : undefined)};
`;

const PeriodMetadata = ({ period }: PeriodMetadataProps) => {
  const percentEnrolled = period.class.enrolments / period.class.capacity;

  return (
    <>
      <StyledCapacityIndicator percentEnrolled={percentEnrolled}>
        {percentEnrolled === 1 ? <StyledWarningIcon /> : <StyledPeopleIcon />}
        {period.class.enrolments}/{period.class.capacity}{' '}
      </StyledCapacityIndicator>
      ({period.time.weeks.length > 0 ? 'Weeks' : 'Week'} {period.time.weeksString})<br />
      <StyledLocationIcon />
      {period.locations[0] + (period.locations.length > 1 ? ` + ${period.locations.length - 1}` : '')}
    </>
  );
};

const DroppedClass: React.FC<DroppedClassProps> = ({
  cardData,
  color,
  y,
  earliestStartTime,
  hasClash,
  handleSelectClass,
  cardWidth,
  clashIndex,
  groupedClashes,
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

  let clashColour = `solid orange ${borderWidth}px`;

  let numNonPermittedClashes = 0;
  if ('time' in cardData) {
    // Find the clash group that the class is in.
    for (const clashGroup of groupedClashes[cardData.time.day - 1]) {
      if (!clashGroup.includes(cardData)) {
        continue;
      }
      let isOverlapped = false;
      // Lecture (online or offline) + any class is always a permitted clash.
      // The only non-permitted clash is like tute + tute or tute + exam etc.
      for (const clashClass of clashGroup) {
        if (!clashClass.class.activity.includes('Lecture')) {
          numNonPermittedClashes += 1;
        }
        // Check if the current cardData has weeks that are overlapping with
        // the weeks of the current clashClass.
        // This is so that two classes with clashing time but different weeks
        // are not supposed to clash (no border).
        const checkOverlappingWeeks = cardData.time.weeks.some((element) => {
          return clashClass.time.weeks.indexOf(element) !== -1;
        });
        if (checkOverlappingWeeks && clashClass.class.id !== cardData.class.id) {
          isOverlapped = true;
        }
      }
      if (
        numNonPermittedClashes > 1 &&
        clashGroup.filter(
          (clashClass) => !clashClass.class.activity.includes('Lecture') && clashClass.class.id !== clashGroup[0].class.id
        ) !== []
      ) {
        clashColour = `solid red ${borderWidth}px`;
      }
      if (!isOverlapped) {
        clashColour = `solid transparent ${borderWidth}px`;
      }
    }
  }

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
        width={cardWidth}
      >
        <StyledCourseClassInner
          backgroundColor={color}
          hasClash={hasClash}
          isSquareEdges={isSquareEdges}
          cardWidth={cardWidth}
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
          {/*TODO: improve the look-and-feel of the fullscreen button; maybe surround with a solid box/square to cover content underneath for legibility */}
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
