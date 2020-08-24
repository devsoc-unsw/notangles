import React, {
  FunctionComponent, useState, useRef,
} from 'react';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import {
  useDrag, defaultTransition, classTransformStyle
} from './DragManager';
import { timeToPosition } from './Dropzone';
import {
  ClassPeriod, SelectedClasses,
} from '../../interfaces/CourseData';

const classMargin = 2;

const StyledCourseClass = styled.div<{
  classPeriod: ClassPeriod
  dragTarget: ClassPeriod | null
  isElevated: boolean
}>`
  grid-column: 2;
  grid-row: 2 / ${({classPeriod}) => (
    timeToPosition(classPeriod.time.end) - timeToPosition(classPeriod.time.start) + 2
  )};
  transform: ${({classPeriod, isElevated}) => (
    classTransformStyle(classPeriod, isElevated)
  )};
  transition: ${defaultTransition};

  // above vs. below app bar
  z-index: ${({classPeriod, dragTarget, isElevated}) => {
    let z = isElevated ? 1200 : 1000;
    if (dragTarget !== null && classPeriod === dragTarget) {
      z++;
    }
    return z;
  }};

  // position over timetable borders
  position: relative;

  padding: ${classMargin}px;
  width:  calc(100% + ${1 / devicePixelRatio}px);
  height: calc(100% + ${1 / devicePixelRatio}px);
  padding-right:  ${classMargin + 1 / devicePixelRatio}px;
  padding-bottom: ${classMargin + 1 / devicePixelRatio}px;
  box-sizing: border-box;
  cursor: ${({dragTarget, isElevated}) => {
    if (dragTarget && !isElevated) return 'inherit';
    return isElevated ? 'grabbing' : 'grab';
  }};
`;

const StyledCourseClassInner = styled(Card).withConfig({
  shouldForwardProp: (prop) => !['backgroundColor'].includes(prop),
}) <{
  backgroundColor: string
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  
  background-color: ${({backgroundColor}) => backgroundColor};
  color: white;
  font-size: 0.9rem;
  border-radius: 7px;
  transition: ${defaultTransition};

  min-width: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 10px;
  position: relative;

  p {
    width: 100%;
    margin: 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

interface DroppedClassProps {
  classPeriod: ClassPeriod
  color: string
}

const DroppedClass: FunctionComponent<DroppedClassProps> = ({
  classPeriod,
  color,
}) => {
  const {
    course,
    activity,
    enrolments,
    capacity,
  } = classPeriod.class;

  // if (classPeriod.time.day == 3) console.log("update!");

  const { dragTarget, setDragTarget } = useDrag();
  const { weeks, weeksString } = classPeriod.time;

  const onDown = (event: any) => {
    setDragTarget(classPeriod, event.currentTarget);
  };

  const isElevated = (
    dragTarget !== null
    && classPeriod.class.activity === dragTarget.class.activity
  );

  return (
    <StyledCourseClass
      classPeriod={classPeriod}
      dragTarget={dragTarget}
      isElevated={isElevated}
      onMouseDown={onDown}
      style={{ left: 0, top: 0 }}
    >
      <StyledCourseClassInner
        backgroundColor={color}
        elevation={isElevated ? 24 : 3}
      >
        <p>
          <b>
            {course.code}
            {' '}
            {activity}
          </b>
        </p>
        <p>
          <LocationOnIcon fontSize="inherit" />
          {`${classPeriod.locationShort} `}
          <PeopleAltIcon fontSize="inherit" />
          {` ${enrolments}/${capacity}`}
        </p>
        <p>{`${weeks.length > 0 ? 'Weeks' : 'Week'} ${weeksString}`}</p>
      </StyledCourseClassInner>
    </StyledCourseClass>
  );
};

interface DroppedClassesProps {
  selectedClasses: SelectedClasses
  assignedColors: Record<string, string>
}

const DroppedClasses: FunctionComponent<DroppedClassesProps> = ({
  selectedClasses,
  assignedColors,
}) => {
  const { morphPeriods, dragTarget, dropTarget } = useDrag();
  const droppedClasses: JSX.Element[] = [];
  const periodKeys = useRef(new Map<ClassPeriod, number>());
  const keyCounter = useRef(0);
  const prevPeriods = useRef<ClassPeriod[]>([]);
  const newPeriods: ClassPeriod[] = [];

  Object.values(selectedClasses).forEach((activities) => {
    Object.values(activities).forEach((classData) => {
      if (classData) {
        classData.periods.forEach((classPeriod) => {
          newPeriods.push(classPeriod);
        });
      }
    });
  });

  const prevPeriodKeys = new Map(periodKeys.current);

  // console.log("===")
  morphPeriods(
    prevPeriods.current, newPeriods, dragTarget, dropTarget
  ).forEach((morphPeriod, i) => {
    const prevPeriod = prevPeriods.current[i];
    
    if (morphPeriod && morphPeriod !== prevPeriod) {
      const periodKey = prevPeriodKeys.get(prevPeriod);
      
      if (periodKey) {
        periodKeys.current.set(morphPeriod, periodKey);
      }
    }
  });

  // console.log(periodKeys.current);
  newPeriods.forEach((classPeriod) => {
    let key = periodKeys.current.get(classPeriod);
    // if (!key) console.log("!", classPeriod.time.day);
    key = key !== undefined ? key : ++keyCounter.current;
    // console.log(keyCounter.current);

    droppedClasses.push(
      <DroppedClass
        key={`${key}`}
        classPeriod={classPeriod}
        color={assignedColors[classPeriod.class.course.code]}
      />,
    );

    periodKeys.current.set(classPeriod, key);
  });
  
  // shallow copy
  prevPeriods.current = [...newPeriods];
  
  // sort by key to prevent disruptions to transitions
  droppedClasses.sort((a, b) => (
    a.key && b.key ? Number(a.key) - Number(b.key) : 0
  ));

  return <>{droppedClasses}</>;
};

export default DroppedClasses;
