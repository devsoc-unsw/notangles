import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import { useDrag } from './DragManager';
import { timeToPosition } from './Dropzone';
import {
  CourseData, ClassPeriod, ClassData,
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
  isDragging: boolean
}>`
  grid-column: 2;
  grid-row: 2 / ${(props) => (
    timeToPosition(props.classPeriod.time.end) - timeToPosition(props.classPeriod.time.start) + 2
  )};
  transform: translate(
    ${(props) => getClassTranslateX(props.classPeriod)}%,
    ${(props) => getClassTranslateY(props.classPeriod)}%
  ) scale(${(props) => (props.isDragging ? 1.2 : 1)});

  z-index: 1200;
  padding: ${classMargin}px;
  // position over timetable borders
  position: relative;
  width:  calc(100% + ${1 / devicePixelRatio}px);
  height: calc(100% + ${1 / devicePixelRatio}px);
  padding-right:  ${classMargin + 1 / devicePixelRatio}px;
  padding-bottom: ${classMargin + 1 / devicePixelRatio}px;
  box-sizing: border-box;
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
  cursor: move;
  font-size: 0.9rem;
  border-radius: 7px;
  transition: 200ms;

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
  selectedCourses: CourseData[]
  selectedClasses: ClassData[]
  assignedColors: Record<string, string>
}

const DroppedClasses: FunctionComponent<DroppedClassesProps> = ({
  selectedCourses,
  selectedClasses,
  assignedColors,
}) => {
  const droppedClasses: JSX.Element[] = [];

  selectedCourses.forEach((course) => {
    const allClasses = Object.values(course.activities).flatMap((x) => x);
    allClasses.filter(
      (classData) => selectedClasses.includes(classData),
    ).forEach((classData) => {
      classData.periods.forEach((classPeriod) => {
        droppedClasses.push(
          <DroppedClass
            key={`${classPeriod.location}-${JSON.stringify(classPeriod.time)}`}
            classPeriod={classPeriod}
            color={assignedColors[course.code]}
          />,
        );
      });
    });
  });

  return <>{droppedClasses}</>;
};

export default DroppedClasses;
