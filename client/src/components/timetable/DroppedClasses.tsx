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
  isDragging: boolean
}>`
  grid-column: 2;
  grid-row: 2 / ${({classPeriod}) => (
    timeToPosition(classPeriod.time.end) - timeToPosition(classPeriod.time.start) + 2
  )};
  transform: ${({classPeriod}) => classTransformStyle(classPeriod, false)};
  transition: ${defaultTransition};

  // above vs. below app bar
  z-index: ${({isDragging}) => (isDragging ? 1200 : 1000)};

  // position over timetable borders
  position: relative;

  padding: ${classMargin}px;
  width:  calc(100% + ${1 / devicePixelRatio}px);
  height: calc(100% + ${1 / devicePixelRatio}px);
  padding-right:  ${classMargin + 1 / devicePixelRatio}px;
  padding-bottom: ${classMargin + 1 / devicePixelRatio}px;
  box-sizing: border-box;
  cursor: ${({dragTarget, isDragging}) => {
    if (dragTarget && !isDragging) return 'inherit';
    return isDragging ? 'grabbing' : 'grab';
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

  const [isDragging, setIsDragging] = useState(false);
  const { dragTarget, setDragTarget } = useDrag();
  const { weeks, weeksString } = classPeriod.time;

  if (isDragging && !dragTarget) setIsDragging(false);

  const onDown = (event: any) => {
    setDragTarget(classPeriod, event.currentTarget);
    setIsDragging(true);
  };

  return (
    <StyledCourseClass
      classPeriod={classPeriod}
      dragTarget={dragTarget}
      isDragging={isDragging}
      onMouseDown={onDown}
      style={{ left: 0, top: 0 }}
    >
      <StyledCourseClassInner
        backgroundColor={color}
        elevation={isDragging ? 24 : 3}
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

  morphPeriods(
    prevPeriods.current, newPeriods, dragTarget, dropTarget
  ).forEach((morphPeriod, i) => {
    const prevPeriod = prevPeriods.current[i];

    if (morphPeriod && morphPeriod !== prevPeriod) {
      const periodKey = periodKeys.current.get(prevPeriod);

      if (periodKey) {
        periodKeys.current.set(morphPeriod, periodKey);
        periodKeys.current.delete(prevPeriod);
      }
    }
  });

  newPeriods.forEach((classPeriod) => {
    let key = periodKeys.current.get(classPeriod);
    key = key !== undefined ? key : ++keyCounter.current;

    droppedClasses.push(
      <DroppedClass
        key={`classPeriod-${key}`}
        classPeriod={classPeriod}
        color={assignedColors[classPeriod.class.course.code]}
      />,
    );

    periodKeys.current.set(classPeriod, key);
  });

  // shallow copy
  prevPeriods.current = [...newPeriods];

  return <>{droppedClasses}</>;
};

export default DroppedClasses;
