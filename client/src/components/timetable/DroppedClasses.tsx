import React, {
  FunctionComponent, useState, useRef, useEffect
} from 'react';
import { CSSTransitionGroup } from 'react-transition-group'
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import {
  // useDrag,
  // useMorph,
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
  timeToPosition
} from '../../utils/Drag';
import {
  ClassPeriod, CourseData, SelectedClasses,
} from '../../interfaces/CourseData';
import { inventoryMargin } from './Timetable';

const classTranslateX = (cardData: CardData, days?: string[]) => {
  if (isPeriod(cardData)) {
    return `${(cardData.time.day - 1) * 100}%`;
  } else if (days) { // not a period, so in the inventory
    // `devicePixelRatio` refers to the width of a timetable border
    return `calc(${days.length * 100}% + ${inventoryMargin + devicePixelRatio}px)`;
  }
  return 0;
};

const classTranslateY = (cardData: CardData, y?: number) => {
  let result = 0;
  if (isPeriod(cardData)) {
    // height compared to standard row height
    const heightFactor = cardData.time.end - cardData.time.start;
    // number of rows to offset down
    const offsetRows = timeToPosition(cardData.time.start) - 2;
    // calculate translate percentage (relative to height)
    result = (offsetRows / heightFactor);
  } else if (y) { // not a period, so in the inventory
    result = y;
  }
  return `${result * 100}%`;
};

export const classTransformStyle = (cardData: CardData, days?: string[], y?: number) => (
  `translate(${classTranslateX(cardData, days)}, ${classTranslateY(cardData, y)})`
);

const classMargin = 2;
const transitionName = "class";

const StyledCourseClass = styled.div<{
  cardData: CardData
  days: string[]
  y?: number
  // dragTarget: ClassPeriod | null
  // isElevated: boolean
}>`
  grid-column: 2;
  grid-row: 2 / 3;
  transform: ${({ cardData, days, y }) => (
    classTransformStyle(cardData, days, y)
  )};
  transition: ${defaultTransition};

  // position over timetable borders
  position: relative;
  width:  calc(100% + ${1 / devicePixelRatio}px);
  height: calc(${({ cardData }) => {
    const heightFactor = !isPeriod(cardData) ? 1 : (
      cardData.time.end - cardData.time.start
    );
    return `${heightFactor * 100}% + ${heightFactor / devicePixelRatio}px`;
  }});
  
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

// const courseClassStyle = ({
//   classPeriod,
//   dragTarget,
//   isElevated,
//   zIndex,
//   cursor,
// }: {
//   classPeriod: ClassPeriod
//   dragTarget: ClassPeriod | null
//   isElevated: boolean
//   zIndex: number
//   cursor: string
// }) => ({
//   gridColumn: 2,
//   gridRow: `2 / ${
//     timeToPosition(classPeriod.time.end) - timeToPosition(classPeriod.time.start) + 2
//   }`,
//   transform: classTransformStyle(classPeriod, isElevated),
//   transition: defaultTransition,

//   // above vs. below app bar
//   zIndex,

//   // position over timetable borders
//   position: 'relative' as 'relative',

//   padding: `${classMargin}px`,
//   width: `calc(100% + ${1 / devicePixelRatio}px)`,
//   height: `calc(100% + ${1 / devicePixelRatio}px)`,
//   paddingRight: `${classMargin + 1 / devicePixelRatio}px`,
//   paddingBottom: `${classMargin + 1 / devicePixelRatio}px`,
//   boxSizing: 'border-box' as 'border-box',
//   cursor,

//   left: 0,
//   top: 0,
// });

// const StyledCourseClassInner = styled(Card).withConfig({
//   shouldForwardProp: (prop) => !['backgroundColor'].includes(prop),
// }) <{
//   backgroundColor: string
// }>`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   flex-direction: column;
  
//   background-color: ${({ backgroundColor }) => backgroundColor};
//   color: white;
//   font-size: 0.9rem;
//   border-radius: 7px;
//   transition: ${defaultTransition};

//   min-width: 0;
//   width: 100%;
//   height: 100%;
//   box-sizing: border-box;
//   padding: 10px;
//   position: relative;

//   p {
//     width: 100%;
//     margin: 0 0;
//     white-space: nowrap;
//     overflow: hidden;
//     text-overflow: ellipsis;
//   }
// `;

const courseClassInnerStyle = ({
  backgroundColor,
}: {
  backgroundColor: string
}) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column' as 'column',

  backgroundColor,
  color: 'white',
  fontSize: '0.9rem',
  borderRadius: '7px',
  transition: defaultTransition,
  backfaceVisibility: 'hidden' as 'hidden',
  fontSmoothing: 'subpixel-antialiased',

  minWidth: 0,
  width: '100%',
  height: '100%',
  boxSizing: 'border-box' as 'border-box',
  padding: '10px',
  position: 'relative' as 'relative',
});

const pStyle = {
  width: '100%',
  margin: '0 0',
  whiteSpace: 'nowrap' as 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

interface DroppedClassProps {
  cardData: CardData
  color: string
  days: string[]
  y?: number
}

const DroppedClass: FunctionComponent<DroppedClassProps> = React.memo(({
  cardData,
  color,
  days,
  y
}) => {
  const element = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (element.current) registerCard(cardData, element.current);
    return () => {
      if (element.current) unregisterCard(cardData, element.current);
    };
  });

  // const [dragTarget, setDragTarget] = useDrag();

  const onDown = (event: any) => {
    setDragTarget(cardData, event);
  };

  // const isElevated = (
  //   dragTarget !== null
  //   && classPeriod.class.courseCode === dragTarget.class.courseCode
  //   && classPeriod.class.activity === dragTarget.class.activity
  // );

  // let zIndex = isElevated ? 1200 : 1000;
  // if (dragTarget !== null && classPeriod === dragTarget) {
  //   zIndex++;
  // }

  // let cursor;
  // if (dragTarget && !isElevated) {
  //   cursor = 'inherit';
  // } else {
  //   cursor = isElevated ? 'grabbing' : 'grab';
  // }

  let activityMaxPeriods = 0;
  if (!isPeriod(cardData)) {
    activityMaxPeriods = Math.max(
      ...cardData.class.course.activities[cardData.class.activity].map(
        (classData) => classData.periods.length
      )
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
      // dragTarget={dragTarget}
      // isElevated={isElevated}
    // <div
    //   onMouseDown={onDown}
    //   style={courseClassStyle({
    //     classPeriod,
    //     dragTarget,
    //     isElevated,
    //     zIndex,
    //     cursor,
    //   })}
    >
      <Card
        // elevation={isElevated ? 24 : 3}
        style={courseClassInnerStyle({
          backgroundColor: color
        })}
      >
      {/* <StyledCourseClassInner
        // elevation={isElevated ? 24 : 3}
        backgroundColor={color}
      > */}
        <p style={pStyle}>
        {/* <p> */}
          <b>
            {cardData.class.course.code}
            {' '}
            {cardData.class.activity}
          </b>
        </p>
        {/* {isPeriod(cardData) && (
          <p style={pStyle}>
            <LocationOnIcon fontSize="inherit" />
            {`${cardData.locationShort} `}
          </p>
        )} */}
        {isPeriod(cardData) && (
          <p style={pStyle}>
            <PeopleAltIcon fontSize="inherit" /> {' '}
            {cardData.class.enrolments}/{cardData.class.capacity} {' '}
            ({cardData.time.weeks.length > 0 ? 'Weeks' : 'Week'} {cardData.time.weeksString})
          </p>
        )}
        {!isPeriod(cardData) && (
          <p style={pStyle}>
            {activityMaxPeriods} class{activityMaxPeriods !== 1 && "es"}
          </p>
        )}
      </Card>
      {/* </StyledCourseClassInner> */}
      {/* </div> */}
    </StyledCourseClass>
  );
});

const getInventoryPeriod = (courses: CourseData[], courseCode: string, activity: string) => (
  courses.find((course) => course.code === courseCode)?.inventoryData[activity]
)

interface DroppedClassesProps {
  selectedCourses: CourseData[]
  selectedClasses: SelectedClasses
  assignedColors: Record<string, string>
  days: string[]
}

const DroppedClasses: FunctionComponent<DroppedClassesProps> = ({
  selectedCourses,
  selectedClasses,
  assignedColors,
  days,
}) => {
  const droppedClasses: JSX.Element[] = [];
  const prevCards = useRef<CardData[]>([]);
  const newCards: CardData[] = [];
  const keyCounter = useRef(0);
  const inventoryCards = useRef<CardData[]>([]);

  const [cardKeys] = useState<
    Map<CardData, number>
  >(
    new Map<CardData, number>()
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
        // course={classPeriod.class.course}
        // activity={classPeriod.class.activity}
        cardData={cardData}
        color={assignedColors[cardData.class.course.code]}
        days={days}
        y={!isPeriod(cardData) ? inventoryCards.current.indexOf(cardData) : undefined}
      />
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
      style={{display: "contents"}}
      transitionName={transitionName}
      transitionEnterTimeout={transitionTime}
      transitionLeaveTimeout={transitionTime}
    >
      {droppedClasses}
    </CSSTransitionGroup>
  );
};

export default DroppedClasses;
