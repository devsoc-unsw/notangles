import React, { FunctionComponent } from 'react';
import { useDrag } from 'react-dnd';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';

import {
  CourseData, Period, ClassData,
} from '../../interfaces/CourseData';
import { timeToPosition } from './Dropzone';

const StyledCourseClass = styled(Card).withConfig({
  shouldForwardProp: (prop) => ['children'].includes(prop),
}) <{
  isDragging: boolean
  classTime: Period
  backgroundColor: string
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  grid-column: ${(props) => props.classTime.time.day + 1};
  grid-row: ${(props) => timeToPosition(props.classTime.time.start)} /
            ${(props) => timeToPosition(props.classTime.time.end)};

  background-color: ${(props) => props.backgroundColor};
  opacity: ${(props) => (props.isDragging ? 0 : 1)};
  color: white;
  cursor: move;
  font-size: 0.9rem;
  border-radius: 6px;

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
  classTime: Period
  color: string
}

const DroppedClass: FunctionComponent<DroppedClassProps> = ({
  classData,
  classTime,
  color,
}) => {
  const {
    courseCode,
    activity,
    enrolments,
    capacity,
  } = classData;

  const [{ isDragging }, drag] = useDrag({
    item: {
      type: `${courseCode}-${activity}`,
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
    >
      <p>
        <b>
          {courseCode}
          {' '}
          {activity}
        </b>
      </p>
      <p>{`${classTime.locationShort}`}</p>
      <p>{`${enrolments}/${capacity} enrolled`}</p>
      <p>{`${isMultipleWeeks(weeks) ? 'Weeks' : 'Week'} ${weeks.replace(/,/g, ', ')}`}</p>
    </StyledCourseClass>
  );
};

interface DroppedClassesProps {
  selectedCourses: CourseData[]
  selectedClasses: ClassData[]
  assignedColors: Record<string, string>
}

const buildDroppedClass = ({
  classData,
  classTime,
  course,
  assignedColors,
}: {
  classData: ClassData,
  classTime: Period,
  course: CourseData,
  assignedColors: Record<string, string>
}): JSX.Element => (
  <DroppedClass
    key={`${classData.classId}-${JSON.stringify(classTime)}`}
    classData={classData}
    classTime={classTime}
    color={assignedColors[course.courseCode]}
  />
);

const DroppedClasses: FunctionComponent<DroppedClassesProps> = ({
  selectedCourses,
  selectedClasses,
  assignedColors,
}) => {
  const droppedClasses: JSX.Element[] = [];

  selectedCourses.forEach((course) => {
    const allClasses = Object.values(course.classes).flatMap((x) => x);
    allClasses.filter(
      (classData) => selectedClasses.includes(classData),
    ).forEach((classData) => {
      classData.periods.forEach((classTime) => {
        droppedClasses.push(
          buildDroppedClass({
            classData,
            classTime,
            course,
            assignedColors,
          }),
        );
      });
    });
  });

  return <>{droppedClasses}</>;
};

export default DroppedClasses;
