import React, {
  FunctionComponent, useState, useRef,
} from 'react';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import { useDrag, defaultTransition } from './DragManager';
import { timeToPosition } from './Dropzone';
import {
  ClassPeriod, SelectedClasses,
} from '../../interfaces/CourseData';

const getClassTranslateX = (classPeriod: ClassPeriod) => (
  (classPeriod.time.day - 1) * 100
);

const getClassTranslateY = (classPeriod: ClassPeriod) => {
  // height compared to standard row height
  const heightFactor = classPeriod.time.end - classPeriod.time.start;
  // number of rows to offset down
  const offsetRows = timeToPosition(classPeriod.time.start) - 2;
  // calculate translate percentage (relative to height)
  return (offsetRows / heightFactor) * 100;
};

const classMargin = 2;

const StyledCourseClass = styled.div<{
  classPeriod: ClassPeriod
  dragTarget: ClassPeriod | null
  isDragging: boolean
}>`
  grid-column: 2;
  grid-row: 2 / ${(props) => (
    timeToPosition(props.classPeriod.time.end) - timeToPosition(props.classPeriod.time.start) + 2
  )};
  transform: translate(
    ${(props) => getClassTranslateX(props.classPeriod)}%,
    ${(props) => getClassTranslateY(props.classPeriod)}%
  ) scale(${(props) => (props.isDragging ? 1.1 : 1)});
  transition: ${defaultTransition};

  // above vs. below app bar
  z-index: ${(props) => (props.isDragging ? 1200 : 1000)};

  // position over timetable borders
  position: relative;

  padding: ${classMargin}px;
  width:  calc(100% + ${1 / devicePixelRatio}px);
  height: calc(100% + ${1 / devicePixelRatio}px);
  padding-right:  ${classMargin + 1 / devicePixelRatio}px;
  padding-bottom: ${classMargin + 1 / devicePixelRatio}px;
  box-sizing: border-box;
  cursor: ${(props) => {
    if (props.dragTarget && !props.isDragging) return 'inherit';
    return props.isDragging ? 'grabbing' : 'grab';
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
  
  background-color: ${(props) => props.backgroundColor};
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
  const { weeks } = classPeriod.time;

  if (isDragging && !dragTarget) setIsDragging(false);

  const isMultipleWeeks = (wks: string) => (
    wks.includes(',') || wks.includes('-')
  );

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
        <p>{`${isMultipleWeeks(weeks) ? 'Weeks' : 'Week'} ${weeks.replace(/,/g, ', ')}`}</p>
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
  const { morphPeriods } = useDrag();
  const droppedClasses: JSX.Element[] = [];
  const periodKeys = useRef(new Map<ClassPeriod, number>());
  const keyCounter = useRef(0);
  const prevPeriods = useRef<ClassPeriod[]>([]);
  const newPeriods: ClassPeriod[] = [];

  Object.values(selectedClasses).forEach((activities) => {
    Object.values(activities).forEach((classData) => {
      if (classData !== null) {
        classData.periods.forEach((classPeriod) => {
          newPeriods.push(classPeriod);
        });
      }
    });
  });

  morphPeriods(prevPeriods.current, newPeriods).forEach((morphPeriod, i) => {
    const prevPeriod = prevPeriods.current[i];

    if (morphPeriod !== null && morphPeriod !== prevPeriod) {
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
