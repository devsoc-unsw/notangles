import React, { useContext, useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { LocationOn, OpenInFull, PeopleAlt, Warning } from '@mui/icons-material';
import { Button, Card, Grid } from '@mui/material';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { yellow } from '@mui/material/colors';
import { styled } from '@mui/system';

import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { defaultStartTime } from '../../constants/timetable';
import { Activity, ClassData, ClassPeriod, ClassTime, CourseCode, InInventory } from '../../interfaces/Course';
import { DroppedClassesProps, DroppedClassProps, PeriodMetadataProps } from '../../interfaces/PropTypes';

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
import ExpandedView from './ExpandedView';
import { getClassMargin, rowHeight } from './TimetableLayout';

export const inventoryMargin = 10;

const classTranslateX = (cardData: CardData, days?: string[], clashIndex?: number, width?:number) => {
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

export const classTransformStyle = (cardData: CardData, earliestStartTime: number, days?: string[], y?: number, clashIndex?: number, width?:number) =>
`translate(${classTranslateX(cardData, days, clashIndex, width)}, ${classTranslateY(cardData, earliestStartTime, y)})`;

const transitionName = 'class';

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
  },
`;

const StyledCourseClass = styled('div', {
  shouldForwardProp: (prop) => !['cardData', 'days', 'y', 'earliestStartTime', 'isSquareEdges'].includes(prop.toString()),
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
  transform: ${({ cardData, earliestStartTime, days, y, clashIndex, width }) => classTransformStyle(cardData, earliestStartTime, days, y, clashIndex, width)};
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
  shouldForwardProp: (prop) => !['backgroundColor', 'hasClash', 'isSquareEdges', 'cardWidth', 'clashColour'].includes(prop.toString()),
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
  outline-offset: -4px;
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

const DroppedClass: React.FC<DroppedClassProps> = ({ cardData, color, y, earliestStartTime, hasClash, handleSelectClass, cardWidth, clashIndex, groupedClashes }) => {
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

  let clashColour = "solid orange 4px";
  
  let numNonPermittedClashes = 0;
  if ("time" in cardData) {
    // Find the clash group that the class is in.
    for (const clashGroup of groupedClashes[cardData.time.day - 1]) {
      if (!clashGroup.includes(cardData)) {
        continue;
      }
      // Lecture (online or offline) + any class is always a permitted clash.
      // The only non-permitted clash is like tute + tute or tute + exam etc.
      for (const clashClass of clashGroup) {
        if (!clashClass.class.activity.includes('Lecture')) {
          numNonPermittedClashes += 1;
        }
      }
      if (numNonPermittedClashes > 1 &&
        clashGroup.filter(clashClass => !clashClass.class.activity.includes('Lecture') && clashClass.class.id !== clashGroup[0].class.id) !== []) {
        clashColour = "solid red 4px";
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
        <StyledCourseClassInner backgroundColor={color} hasClash={hasClash} isSquareEdges={isSquareEdges} cardWidth={cardWidth} clashColour={clashColour} >
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

const DroppedClasses: React.FC<DroppedClassesProps> = ({ assignedColors, handleSelectClass }) => {
  const [cardKeys] = useState<Map<CardData, number>>(new Map<CardData, number>());

  const days = useContext(AppContext).days;
  const { selectedCourses, selectedClasses } = useContext(CourseContext);

  const droppedClasses: JSX.Element[] = [];
  const prevCards = useRef<CardData[]>([]);
  const newCards: CardData[] = [];

  const keyCounter = useRef(0);
  const inventoryCards = useRef<CardData[]>([]);

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

  const hasTimeOverlap = (period1: ClassTime, period2: ClassTime) =>
    period1.day === period2.day &&
    ((period1.end > period2.start && period1.start < period2.end) ||
    (period2.end > period1.start && period2.start < period1.end));

  const checkClashes = () => {
    const newClashes: ClassPeriod[] = [];
  
    const flatPeriods = Object.values(selectedClasses)
      .flatMap((activities) => Object.values(activities))
      .flatMap((classData) => (classData ? classData.periods : []));
  
    flatPeriods.forEach((period1) => {
      flatPeriods.forEach((period2) => {
        if (period1.class.id !== period2.class.id && hasTimeOverlap(period1.time, period2.time)) {
          if (!newClashes.includes(period1)) {
            newClashes.push(period1);
          }
          if (!newClashes.includes(period2)) {
            newClashes.push(period2);
          }
        }
      });
    });
  
    return newClashes;
  };
  
  const sortClashesByTime = (clashes: ClassPeriod[]) => {
    // Sort clashes to group them according to the days of the week they are in.
    const sortedClashes: Record<number, ClassPeriod[]> = days.map((_) => []);
    clashes.forEach((clash) => sortedClashes[clash.time.day - 1].push(clash));
  
    return sortedClashes;
  }
  
  const groupClashes = (sortedClashes: Record<number, ClassPeriod[]>) => {
    // Clashes are grouped according to their day. Clashes in each day are further separated according to how
    // many classes a single clash affects so each card can later be split accordingly.
    const groupedClashes: Record<number, ClassPeriod[][]> = days.map((_) => []);
    
    Object.entries(sortedClashes).forEach(([day, clashes]) => {
      const dayInt = parseInt(day);
      for (const clash of clashes) {
        if (groupedClashes[dayInt].length === 0) {
          // If there are no clashes in a day,
          // add a new list of clashes with just that class
          groupedClashes[dayInt].push([clash]);
        } else {
          let hasAdded = false;
          
          for (let i = 0; i < groupedClashes[dayInt].length; i++) {
            const currGroup = groupedClashes[dayInt][i];
            // Clash occurs for two classes A and B when
            // (StartA < EndB) and (EndA > StartB)
            if (clash.time.start < currGroup[groupClashes.length - 1].time.end &&
              clash.time.end > currGroup[0].time.start) {
                currGroup.push(clash);
                hasAdded = true;
              }
            }
            
          // If we haven't added the clash to any clashes list, add it to its own list of clashes as it
          // means that it will be a part of a new group of clashes (no other classes that we have grouped
          // have happened at the same time yet).
          if (!hasAdded) {
            groupedClashes[dayInt].push([clash]);
          }
        }
      }
    })
  
    return groupedClashes;
  }
  
  const getCardWidth = (groupedClashes: Record<number, ClassPeriod[][]>, cardData: CardData) => {
    // Returns the card width of a clashing class by dividing the default width of a card with how many
    // clashes there are happening during that time.
    let cardWidth = 100;
    let clashIndex = 0;
  
    if ("time" in cardData) {
      for (const clashGroup of groupedClashes[cardData.time.day - 1]) {
        if (clashGroup.includes(cardData)) {
          return [cardWidth / clashGroup.length, clashGroup.indexOf(cardData)];
        }
      }
    }
  
    return [cardWidth, clashIndex];
  };    

  const clashes = checkClashes();
  const sortedClashes = sortClashesByTime(clashes);
  const groupedClashes = groupClashes(sortedClashes);

  console.log(groupedClashes);

  newCards.forEach((cardData) => {
    let key = cardKeys.get(cardData);
    key = key !== undefined ? key : ++keyCounter.current;

    let [cardWidth, clashIndex] = getCardWidth(groupedClashes, cardData);

    /*
      It goes from chronological order (start of the day to end of the day)
      1. First class automatically goes to a clash element in the clashes list
      2. If the next class clashes, it joins that list, if it doesn't then it becomes a new element
      3. Update the start and end times (this is going to be the very start of the first class in the clashes list, and the end time will be the very end of the last class in the clashes list)
      Monday:
      - clash 1: 9am - 12pm (consisted of 3 classes)
      - clash 2: 4pm - 7pm (consisted of 2 classes)
      [
        [ // day, start, end
          [class 1, class 2], // clash 1
          [], // clash 2
        ],
        [
        ],
        ...
      ]
    */
    droppedClasses.push(
      <DroppedClass
        key={`${key}`}
        cardData={cardData}
        color={assignedColors[cardData.class.course.code]}
        y={!isPeriod(cardData) ? inventoryCards.current.indexOf(cardData) : undefined}
        earliestStartTime={earliestStartTime}
        hasClash={isPeriod(cardData) ? clashes.includes(cardData) : false}
        cardWidth={cardWidth}
        clashIndex={clashIndex}
        handleSelectClass={handleSelectClass}
        groupedClashes={groupedClashes}
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
