import React, { FunctionComponent } from 'react';
import { useDrag } from 'react-dnd';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';

import {
  CourseData, ClassPeriod, ClassData,
} from '@notangles/common';
import { timeToPosition } from './Dropzone';

const StyledCourseClass = styled(Card).withConfig({
  shouldForwardProp: (prop) => ['children'].includes(prop),
}) <{
  isDragging: boolean
  classTime: ClassPeriod
  backgroundColor: string
  hasClash: boolean
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 20;

  grid-column: ${(props) => props.classTime.time.day + 1};
  grid-row: ${(props) => timeToPosition(props.classTime.time.start)} /
            ${(props) => timeToPosition(props.classTime.time.end)};

  background-color: ${(props) => props.backgroundColor};
  opacity: ${(props) => (props.isDragging ? 0 : 1)};
  color: white;
  cursor: move;
  font-size: 0.9rem;
  border-radius: 6px;
  border: ${(props) => (props.hasClash ? 'solid rgba(227, 81, 61, 0.95) 3px' : 'none')};

  padding: 10px;
  margin: 2px;
  position: relative;
  bottom: 0.5px;

  p {
    margin: 0 0;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

interface DroppedClassProps {
  classData: ClassData
  classTime: ClassPeriod
  color: string
  hasClash: boolean
}

const DroppedClass: FunctionComponent<DroppedClassProps> = ({
  classData,
  classTime,
  color,
  hasClash,
}) => {
  const {
    course,
    activity,
    enrolments,
    capacity,
  } = classData;

  const [{ isDragging }, drag] = useDrag({
    item: {
      type: `${course.code}-${activity}`,
      classData,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const { weeks } = classTime.time;

  const isMultipleWeeks = (wks: string) => (
    wks.includes(',') || wks.includes('-')
  );

  return (
    <StyledCourseClass
      ref={drag}
      isDragging={isDragging}
      backgroundColor={color}
      classTime={classTime}
      hasClash={hasClash}
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
        {`${classTime.locationShort} `}
        <PeopleAltIcon fontSize="inherit" />
        {` ${enrolments}/${capacity}`}
      </p>
      <p>{`${isMultipleWeeks(weeks) ? 'Weeks' : 'Week'} ${weeks.replace(/,/g, ', ')}`}</p>
    </StyledCourseClass>
  );
};

interface DroppedClassesProps {
  selectedCourses: CourseData[]
  selectedClasses: ClassData[]
  assignedColors: Record<string, string>
  clashes: Array<ClassPeriod>
}

const DroppedClasses: FunctionComponent<DroppedClassesProps> = ({
  selectedCourses,
  selectedClasses,
  assignedColors,
  clashes,
}) => {
  const droppedClasses: JSX.Element[] = [];
  selectedCourses.forEach((course) => {
    const allClasses = Object.values(course.activities).flatMap((x) => x);
    allClasses.filter(
      (classData) => selectedClasses.includes(classData),
    ).forEach((classData) => {
      classData.periods.forEach((classTime) => {
        droppedClasses.push(
          <DroppedClass
            key={`${classData.id}-${JSON.stringify(classTime)}`}
            classData={classData}
            classTime={classTime}
            color={assignedColors[course.code]}
            hasClash={clashes.includes(classTime)}
          />,
        );
      });
    });
  });

  return (
    <>
      {droppedClasses}
    </>
  );
};

export default DroppedClasses;
