import React, { useState, useRef, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import TouchRipple from '@material-ui/core/ButtonBase/TouchRipple';
import { CourseData, ClassPeriod, SelectedClasses, InInventory } from '../../interfaces/Course';
import {
  CardData,
  isPeriod,
  setDragTarget,
  setIsSquareEdges,
  morphCards,
  transitionTime,
  defaultTransition,
  getDefaultShadow,
  getElevatedShadow,
  elevatedScale,
  registerCard,
  unregisterCard,
  timeToPosition,
} from '../../utils/Drag';
import { defaultStartTime } from '../../constants/timetable';
import { rowHeight, getClassMargin } from './TimetableLayout';
import { orange, red } from '@material-ui/core/colors';

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

const StyledCourseClass = styled.div<{
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
      box-shadow: ${({ theme, isSquareEdges }) => theme.shadows[getElevatedShadow(isSquareEdges)]};
    }
  }

  &.${transitionName}-enter-active, &.${transitionName}-leave {
    & > div {
      opacity: 1;
      transform: scale(1);
      box-shadow: ${({ theme, isSquareEdges }) => theme.shadows[getDefaultShadow(isSquareEdges)]};
    }
  }

  &.${transitionName}-leave-active {
    & > div {
      opacity: 0;
      // transform: scale(${2 - elevatedScale});
      box-shadow: ${({ theme, isSquareEdges }) => theme.shadows[getDefaultShadow(isSquareEdges)]};
    }
  }
`;

const courseClassInnerStyle = ({
  backgroundColor,
  hasClash,
  isSquareEdges,
}: {
  backgroundColor: string;
  hasClash: boolean;
  isSquareEdges: boolean;
}) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column' as 'column',

  backgroundColor,
  color: 'white',
  fontSize: '0.9rem',
  borderRadius: isSquareEdges ? '0px' : '7px',
  transition: `${defaultTransition}, z-index 0s`,
  backfaceVisibility: 'hidden' as 'hidden',
  fontSmoothing: 'subpixel-antialiased',
  border: hasClash ? 'solid red 4px' : 'solid transparent 0px',
  paddingLeft: 4,
  paddingRight: 4,
  paddingTop: 0,
  paddingBottom: 0,

  minWidth: 0,
  width: '100%',
  height: '100%',
  boxSizing: 'border-box' as 'border-box',
  position: 'relative' as 'relative',
});

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

interface DroppedClassProps {
  cardData: CardData;
  color: string;
  days: string[];
  y?: number;
  earliestStartTime: number;
  hasClash: boolean;
  isSquareEdges: boolean;
  setInfoVisibility(value: boolean): void;
}

// beware memo - if a component isn't re-rendering, it could be why
const DroppedClass: React.FC<DroppedClassProps> = React.memo(
  ({ cardData, color, days, y, earliestStartTime, hasClash, isSquareEdges, setInfoVisibility }) => {
    const element = useRef<HTMLDivElement>(null);
    const rippleRef = useRef<any>(null);

    let timer: number | null = null;
    let rippleStopped = false;
    let ignoreMouse = false;

    setIsSquareEdges(isSquareEdges);

    const onDown = (oldEvent: any) => {
      if (!('type' in oldEvent)) return;
      if (oldEvent.type.includes('mouse') && ignoreMouse) return;
      if (oldEvent.type.includes('touch')) ignoreMouse = true;

      const event = { ...oldEvent };

      if ('start' in rippleRef.current) {
        rippleStopped = false;
        rippleRef.current.start(event);
      }

      const startDrag = () => {
        timer = null;
        setDragTarget(cardData, event);
        setInfoVisibility(false);
      };

      if (oldEvent.type.includes('touch')) {
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
        <Card
          style={courseClassInnerStyle({
            backgroundColor: color,
            hasClash,
            isSquareEdges,
          })}
        >
          <p style={pStyle}>
            <b>
              {cardData.class.course.code} {cardData.class.activity}
            </b>
          </p>
          <p style={pStyleSmall}>
            {isPeriod(cardData) ? (
              <PeriodMetadata period={cardData} />
            ) : (
              <>
                {activityMaxPeriods} class
                {activityMaxPeriods !== 1 && 'es'}
              </>
            )}
          </p>
          <TouchRipple ref={rippleRef} />
        </Card>
      </StyledCourseClass>
    );
  }
);

interface PeriodMetadataProps {
  period: ClassPeriod;
}

const PeriodMetadata = ({ period }: PeriodMetadataProps) => {
  const percentEnrolled = period.class.enrolments / period.class.capacity;

  const enrolledColor = percentEnrolled == 1 ? red[600] : undefined;

  return (
    <div>
      <span
        style={{
          color: enrolledColor,
          fontWeight: 'bolder',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <PeopleAltIcon fontSize="inherit" style={iconStyle} />
        <p>
          {period.class.enrolments}/{period.class.capacity}
        </p>
      </span>
      <br />
      <span>
        ({period.time.weeks.length > 0 ? 'Weeks' : 'Week'} {period.time.weeksString})
      </span>
      <br />
      <span>
        <LocationOnIcon fontSize="inherit" style={iconStyle} />
        {period.locations[0] + (period.locations.length > 1 ? ` + ${period.locations.length - 1}` : '')}
      </span>
    </div>
  );
};

const getInventoryPeriod = (courses: CourseData[], courseCode: string, activity: string) =>
  courses.find((course) => course.code === courseCode)?.inventoryData[activity];

interface DroppedClassesProps {
  selectedCourses: CourseData[];
  selectedClasses: SelectedClasses;
  assignedColors: Record<string, string>;
  days: string[];
  clashes: Array<ClassPeriod>;
  isSquareEdges: boolean;
  setInfoVisibility(value: boolean): void;
}

const DroppedClasses: React.FC<DroppedClassesProps> = ({
  selectedCourses,
  selectedClasses,
  assignedColors,
  days,
  clashes,
  isSquareEdges,
  setInfoVisibility,
}) => {
  const droppedClasses: JSX.Element[] = [];
  const prevCards = useRef<CardData[]>([]);
  const newCards: CardData[] = [];
  const keyCounter = useRef(0);
  const inventoryCards = useRef<CardData[]>([]);

  const [cardKeys] = useState<Map<CardData, number>>(new Map<CardData, number>());

  const earliestStartTime = Math.min(...selectedCourses.map((course) => course.earliestStartTime), defaultStartTime);

  Object.entries(selectedClasses).forEach(([courseCode, activities]) => {
    Object.entries(activities).forEach(([activity, classData]) => {
      if (classData) {
        classData.periods.forEach((classPeriod) => {
          newCards.push(classPeriod);
        });
      } else {
        // in inventory
        const inventoryPeriod = getInventoryPeriod(selectedCourses, courseCode, activity);
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

  newCards.forEach((cardData) => {
    let key = cardKeys.get(cardData);
    key = key !== undefined ? key : ++keyCounter.current;

    droppedClasses.push(
      <DroppedClass
        key={`${key}`}
        cardData={cardData}
        color={assignedColors[cardData.class.course.code]}
        days={days}
        y={!isPeriod(cardData) ? inventoryCards.current.indexOf(cardData) : undefined}
        earliestStartTime={earliestStartTime}
        hasClash={isPeriod(cardData) ? clashes.includes(cardData) : false}
        isSquareEdges={isSquareEdges}
        setInfoVisibility={setInfoVisibility}
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
