import React, {
  FunctionComponent, useState, useRef, useEffect,
} from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import {
  CourseData, ClassPeriod, SelectedClasses,
} from '@notangles/common';
import {
  CardData,
  isPeriod,
  setDragTarget,
  morphCards,
  transitionTime,
  defaultTransition,
  defaultShadow,
  elevatedShadow,
  elevatedScale,
  registerCard,
  unregisterCard,
  timeToPosition,
} from '../../utils/Drag';
import { defaultStartTime } from '../../constants/timetable';

export const inventoryMargin = 10;

const classTranslateX = (cardData: CardData, days?: string[]) => {
  if (isPeriod(cardData)) {
    return `${(cardData.time.day - 1) * 100}%`;
  } if (days) { // not a period, so in the inventory
    // `devicePixelRatio` refers to the width of a timetable border
    return `calc(${days.length * 100}% + ${inventoryMargin + devicePixelRatio}px)`;
  }
  return 0;
};

export const classTranslateY = (cardData: CardData, earliestStartTime: number, y?: number) => {
  let result = 0;
  if (isPeriod(cardData)) {
    // height compared to standard row height
    const heightFactor = cardData.time.end - cardData.time.start;
    // number of rows to offset down
    const offsetRows = timeToPosition(cardData.time.start, earliestStartTime) - 2;
    // calculate translate percentage (relative to height)
    result = (offsetRows / heightFactor);
  } else if (y) { // not a period, so in the inventory
    result = y;
  }
  return `${result * 100}%`;
};

export const classHeight = (cardData: CardData) => {
  const heightFactor = !isPeriod(cardData) ? 1 : (
    cardData.time.end - cardData.time.start
  );
  return `calc(${heightFactor * 100}% + ${heightFactor / devicePixelRatio}px)`;
};

export const classTransformStyle = (
  cardData: CardData, earliestStartTime: number, days?: string[], y?: number,
) => (
  `translate(${classTranslateX(cardData, days)}, ${classTranslateY(cardData, earliestStartTime, y)})`
);

const classMargin = 1;
const transitionName = 'class';

const StyledCourseClass = styled.div<{
  cardData: CardData
  days: string[]
  y?: number
  earliestStartTime: number
}>`
  grid-column: 2;
  grid-row: 2 / 3;
  transform: ${({
    cardData, earliestStartTime, days, y,
  }) => (
    classTransformStyle(cardData, earliestStartTime, days, y)
  )};
  transition: ${defaultTransition};

  // position over timetable borders
  position: relative;
  width:  calc(100% + ${1 / devicePixelRatio}px);
  height: ${({ cardData }) => classHeight(cardData)};

  padding: ${classMargin}px;
  padding-right:  ${classMargin + 1 / devicePixelRatio}px;
  padding-bottom: ${classMargin + 1 / devicePixelRatio}px;
  box-sizing: border-box;
  z-index: 1000;
  cursor: grab;

  &.${transitionName}-enter {
    & > div {
      opacity: 0;
      transform: scale(${elevatedScale});
      box-shadow: ${({ theme }) => theme.shadows[elevatedShadow]};
    }
  }

  &.${transitionName}-enter-active, &.${transitionName}-leave {
    & > div {
      opacity: 1;
      transform: scale(1);
      box-shadow: ${({ theme }) => theme.shadows[defaultShadow]};
    }
  };

  &.${transitionName}-leave-active {
    & > div {
      opacity: 0;
      // transform: scale(${2 - elevatedScale});
      box-shadow: ${({ theme }) => theme.shadows[defaultShadow]};
    }
  };
`;

const courseClassInnerStyle = ({
  backgroundColor,
  hasClash,
  isSquareEdges,
}: {
  backgroundColor: string
  hasClash: boolean
  isSquareEdges: boolean
}) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column' as 'column',

  backgroundColor,
  color: 'white',
  fontSize: '0.9rem',
  borderRadius: isSquareEdges ? '0px' : '7px',
  transition: defaultTransition,
  backfaceVisibility: 'hidden' as 'hidden',
  fontSmoothing: 'subpixel-antialiased',
  border: hasClash ? 'solid red 4px' : 'solid transparent 4px',

  minWidth: 0,
  width: '100%',
  height: '100%',
  boxSizing: 'border-box' as 'border-box',
  padding: 0,
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
  ...pStyle, fontSize: '85%',
};

const iconStyle = {
  verticalAlign: 'top',
};

interface DroppedClassProps {
  cardData: CardData
  color: string
  days: string[]
  y?: number
  earliestStartTime: number
  hasClash: boolean
  isSquareEdges: boolean
}

// beware memo - if a component isn't re-rendering, it could be why
const DroppedClass: FunctionComponent<DroppedClassProps> = React.memo(({
  cardData,
  color,
  days,
  y,
  earliestStartTime,
  hasClash,
  isSquareEdges,
}) => {
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elementCurrent = element.current;
    if (elementCurrent) registerCard(cardData, elementCurrent);
    return () => {
      if (elementCurrent) unregisterCard(cardData, elementCurrent);
    };
  });

  const onDown = (event: any) => {
    setDragTarget(cardData, event);
  };

  let activityMaxPeriods = 0;
  if (!isPeriod(cardData)) {
    activityMaxPeriods = Math.max(
      ...cardData.class.course.activities[cardData.class.activity].map(
        (classData) => classData.periods.length,
      ),
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
            {cardData.class.course.code}
            {' '}
            {cardData.class.activity}
          </b>
        </p>
        {isPeriod(cardData) && (
          <>
            <p style={pStyleSmall}>
              <PeopleAltIcon fontSize="inherit" style={iconStyle} />
              {' '}
              {' '}
              {cardData.class.enrolments}
              /
              {cardData.class.capacity}
              {' '}
              {' '}
              (
              {cardData.time.weeks.length > 0 ? 'Weeks' : 'Week'}
              {' '}
              {cardData.time.weeksString}
              )
            </p>
            <p style={pStyleSmall}>
              <LocationOnIcon fontSize="inherit" style={iconStyle} />
              {cardData.locationShort}
            </p>
          </>
        )}
        {!isPeriod(cardData) && (
          <p style={pStyle}>
            {activityMaxPeriods}
            {' '}
            class
            {activityMaxPeriods !== 1 && 'es'}
          </p>
        )}
      </Card>
    </StyledCourseClass>
  );
});

const getInventoryPeriod = (courses: CourseData[], courseCode: string, activity: string) => (
  courses.find((course) => course.code === courseCode)?.inventoryData[activity]
);

interface DroppedClassesProps {
  selectedCourses: CourseData[]
  selectedClasses: SelectedClasses
  assignedColors: Record<string, string>
  days: string[]
  clashes: Array<ClassPeriod>
  isSquareEdges: boolean
}

const DroppedClasses: FunctionComponent<DroppedClassesProps> = ({
  selectedCourses,
  selectedClasses,
  assignedColors,
  days,
  clashes,
  isSquareEdges,
}) => {
  const droppedClasses: JSX.Element[] = [];
  const prevCards = useRef<CardData[]>([]);
  const newCards: CardData[] = [];
  const keyCounter = useRef(0);
  const inventoryCards = useRef<CardData[]>([]);

  const [cardKeys] = useState<
  Map<CardData, number>
  >(
    new Map<CardData, number>(),
  );

  const earliestStartTime = Math.min(
    ...selectedCourses.map((course) => course.earliestStartTime),
    defaultStartTime,
  );

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
      />,
    );

    cardKeys.set(cardData, key);
  });

  // shallow copy
  prevCards.current = [...newCards];

  // sort by key to prevent disruptions to transitions
  droppedClasses.sort((a, b) => (
    a.key && b.key ? Number(a.key) - Number(b.key) : 0
  ));

  cardKeys.forEach((_, cardData) => {
    if (!newCards.includes(cardData)) {
      cardKeys.delete(cardData);
    }
  });

  return (
    <CSSTransitionGroup
      component="div"
      style={{ display: 'contents' }}
      transitionName={transitionName}
      transitionEnterTimeout={transitionTime}
      transitionLeaveTimeout={transitionTime}
    >
      {droppedClasses}
    </CSSTransitionGroup>
  );
};

export default DroppedClasses;
