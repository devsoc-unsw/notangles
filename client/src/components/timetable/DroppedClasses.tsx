import React, { MouseEvent, TouchEvent, useContext, useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { Card, Grid, IconButton } from '@mui/material';
import { Warning, ArrowLeft, ArrowRight, LocationOn, PeopleAlt } from '@mui/icons-material';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { yellow } from '@mui/material/colors';
import { styled } from '@mui/system';

import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { defaultStartTime } from '../../constants/timetable';
import { Activity, ClassPeriod, CourseCode, InInventory } from '../../interfaces/Course';
import {
  CardData,
  defaultTransition,
  elevatedScale,
  getDefaultShadow,
  getElevatedShadow,
  isPeriod,
  morphCards,
  registerCard,
  setDragTarget,
  timeToPosition,
  transitionTime,
  unregisterCard,
} from '../../utils/Drag';
import { DroppedClassesProps, DroppedClassProps, PeriodMetadataProps } from '../../interfaces/PropTypes';
import { getClassMargin, rowHeight } from './TimetableLayout';

export const inventoryMargin = 10;

const classTranslateX = (cardData: CardData, days?: string[]) => {
  if (isPeriod(cardData)) {
    return `${(cardData.time.day - 1) * 100}%`;
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

export const classTransformStyle = (cardData: CardData, earliestStartTime: number, days?: string[], y?: number) =>
  `translate(${classTranslateX(cardData, days)}, ${classTranslateY(cardData, earliestStartTime, y)})`;

const transitionName = 'class';

const StyledSideArrow = styled(Grid)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledIconShadow = styled(IconButton)`
  width: 20px;
  height: 20px;
  color: white;
`;

const StyledCourseClass = styled('div', {
  shouldForwardProp: (prop) => !['cardData', 'days', 'y', 'earliestStartTime', 'isSquareEdges'].includes(prop.toString()),
})<{
  cardData: CardData;
  days: string[];
  y?: number;
  earliestStartTime: number;
  isSquareEdges: boolean;
}>`
  position: relative;
  grid-column: 2;
  grid-row: 2 / -1;
  transform: ${({ cardData, earliestStartTime, days, y }) => classTransformStyle(cardData, earliestStartTime, days, y)};
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
  shouldForwardProp: (prop) => !['backgroundColor', 'hasClash', 'isSquareEdges'].includes(prop.toString()),
})<{
  backgroundColor: string;
  hasClash: boolean;
  isSquareEdges: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: ${({ backgroundColor }) => backgroundColor};
  color: white;
  font-size: 0.9rem;
  border-radius: ${({ isSquareEdges }) => (isSquareEdges ? '0px' : '7px')};
  transition: ${defaultTransition}, z-index 0s;
  backface-visibility: hidden;
  outline: ${({ hasClash }) => (hasClash ? 'solid red 4px' : 'solid transparent 0px')};
  outline-offset: -4px;
  width: 100%;
  height: 100%;
  position: relative;
`;

const pStyle = {
  width: '100%',
  margin: '0 0',
  whiteSpace: 'nowrap' as 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const pStyleSmall = {
  ...pStyle,
  fontSize: '85%',
};

const iconStyle = {
  verticalAlign: 'top',
};

const iconPeopleStyle = {
  ...iconStyle,
  marginRight: '0.2rem',
};

const iconWarningStyle = {
  ...iconStyle,
  marginRight: '0.2rem',
  color: yellow[400],
};

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
        {percentEnrolled === 1 ? (
          <Warning fontSize="inherit" style={iconWarningStyle} />
        ) : (
          <PeopleAlt fontSize="inherit" style={iconPeopleStyle} />
        )}
        <span>
          {period.class.enrolments}/{period.class.capacity}{' '}
        </span>
      </StyledCapacityIndicator>
      ({period.time.weeks.length > 0 ? 'Weeks' : 'Week'} {period.time.weeksString})<br />
      <LocationOn fontSize="inherit" style={iconStyle} />
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
  shiftClasses,
  hasArrows,
}) => {
  const element = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<any>(null);
  const { setInfoVisibility, isSquareEdges, isHideClassInfo, days, setIsDrag } = useContext(AppContext);

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

      if ((timer || !eventUp.type.includes('move')) && 'stop' in rippleRef.current) {
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
    <StyledCourseClass
      ref={element}
      onMouseDown={onDown}
      onTouchStart={onDown}
      cardData={cardData}
      days={days}
      y={y}
      earliestStartTime={earliestStartTime}
      isSquareEdges={isSquareEdges}
    >
      <StyledCourseClassInner backgroundColor={color} hasClash={hasClash} isSquareEdges={isSquareEdges}>
        <Grid container>
          <StyledSideArrow item xs={1}>
            {hasArrows && (
              <StyledIconShadow size="small" onClick={() => shiftClasses(-1, cardData)}>
                <ArrowLeft />
              </StyledIconShadow>
            )}
          </StyledSideArrow>
          <Grid item xs={10}>
            <p style={pStyle}>
              <b>
                {cardData.class.course.code} {cardData.class.activity}
              </b>
            </p>
            <p style={pStyleSmall}>
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
            </p>
            <TouchRipple ref={rippleRef} />
          </Grid>
          <StyledSideArrow item xs={1}>
            {hasArrows && (
              <StyledIconShadow size="small" onClick={() => shiftClasses(1, cardData)}>
                <ArrowRight />
              </StyledIconShadow>
            )}
          </StyledSideArrow>
        </Grid>
      </StyledCourseClassInner>
    </StyledCourseClass>
  );
};

const DroppedClasses: React.FC<DroppedClassesProps> = ({ assignedColors, clashes, handleSelectClass }) => {
  const droppedClasses: JSX.Element[] = [];
  const prevCards = useRef<CardData[]>([]);
  const newCards: CardData[] = [];
  const keyCounter = useRef(0);
  const inventoryCards = useRef<CardData[]>([]);

  const [cardKeys] = useState<Map<CardData, number>>(new Map<CardData, number>());

  const { isHideFullClasses } = useContext(AppContext);
  const { selectedCourses, selectedClasses } = useContext(CourseContext);

  const earliestStartTime = Math.min(...selectedCourses.map((course) => course.earliestStartTime), defaultStartTime);

  const getInventoryPeriod = (courseCode: CourseCode, activity: Activity) =>
    selectedCourses.find((course) => course.code === courseCode)?.inventoryData[activity];

  Object.entries(selectedClasses).forEach(([courseCode, activities]) => {
    Object.entries(activities).forEach(([activity, classData]) => {
      if (classData) {
        classData.periods.forEach((classPeriod) => {
          newCards.push(classPeriod);
        });
      } else {
        // in inventory
        const inventoryPeriod = getInventoryPeriod(courseCode, activity);
        if (inventoryPeriod) {
          newCards.push(inventoryPeriod);

          if (!inventoryCards.current.includes(inventoryPeriod)) {
            inventoryCards.current.push(inventoryPeriod);
          }
        }
      }
    });
  });

  // clear any inventory cards which no longer exist
  inventoryCards.current = inventoryCards.current.filter((card) => newCards.includes(card));

  const prevCardKeys = new Map(cardKeys);

  morphCards(prevCards.current, newCards).forEach((morphCard, i) => {
    const prevCard = prevCards.current[i];

    if (morphCard && morphCard !== prevCard) {
      const cardKey = prevCardKeys.get(prevCard);

      if (cardKey) {
        cardKeys.set(morphCard, cardKey);
      }
    }
  });

  const isDuplicate = (a: ClassPeriod, b: ClassPeriod) =>
    a.time.day === b.time.day && a.time.start === b.time.start && a.time.end === b.time.end;

  const shiftClasses = (dir: number, c: CardData) => {
    if ('time' in c) {
      const newclasses = c.class.course.activities[c.class.activity].filter((value) =>
        value.periods.some((v) => isDuplicate(v, c) && (!isHideFullClasses || value.enrolments !== value.capacity))
      );

      if (newclasses.length)
        handleSelectClass(
          newclasses[(newclasses.findIndex((v) => v.id === c.class.id) + newclasses.length + dir) % newclasses.length]
        );
    }
  };

  const hasArrows = (c: CardData) =>
    'time' in c &&
    c.class.course.activities[c.class.activity].filter(
      (value) =>
        value.periods.length &&
        value.periods.some((p) => isDuplicate(p, c)) &&
        (!isHideFullClasses || value.enrolments !== value.capacity || value.id === c.class.id)
    ).length > 1;

  newCards.forEach((cardData) => {
    let key = cardKeys.get(cardData);
    key = key !== undefined ? key : ++keyCounter.current;

    droppedClasses.push(
      <DroppedClass
        key={`${key}`}
        cardData={cardData}
        shiftClasses={shiftClasses}
        hasArrows={hasArrows(cardData)}
        color={assignedColors[cardData.class.course.code]}
        y={!isPeriod(cardData) ? inventoryCards.current.indexOf(cardData) : undefined}
        earliestStartTime={earliestStartTime}
        hasClash={isPeriod(cardData) ? clashes.includes(cardData) : false}
      />
    );

    cardKeys.set(cardData, key);
  });

  // shallow copy
  prevCards.current = [...newCards];

  // sort by key to prevent disruptions to transitions
  droppedClasses.sort((a, b) => (a.key && b.key ? Number(a.key) - Number(b.key) : 0));

  cardKeys.forEach((_, cardData) => {
    if (!newCards.includes(cardData)) {
      cardKeys.delete(cardData);
    }
  });

  return (
    <CSSTransition style={{ display: 'contents' }} transitionName={transitionName} timeout={transitionTime}>
      <>{droppedClasses}</>
    </CSSTransition>
  );
};

export default DroppedClasses;
