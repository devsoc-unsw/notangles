import React, { FunctionComponent } from 'react';
import { useDrag } from 'react-dnd';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import {
  CourseData, Period, ClassData,
} from '../../interfaces/CourseData';
import { weekdayToXCoordinate, timeToIndex } from './Dropzone';

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

  grid-column: ${(props) => weekdayToXCoordinate(props.classTime.time.day) + 1};
  grid-row: ${(props) => timeToIndex(props.classTime.time.start)} /
            ${(props) => timeToIndex(props.classTime.time.end)};

  background-color: ${(props) => props.backgroundColor};
  opacity: ${(props) => (props.isDragging ? 0.5 : 1)};
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
  activity: string
  courseCode: string
  color: string
  classTime: Period
}

const DroppedClass: FunctionComponent<DroppedClassProps> = ({
  activity,
  courseCode,
  color,
  classTime,
}) => {
  const [{ isDragging }, drag] = useDrag({
    item: { type: `${courseCode}-${activity}` },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

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
      <p>
        {`${((classTime.time.weeks.includes(',') || classTime.time.weeks.includes('-')) ? 'Weeks ' : 'Week ') + classTime.time.weeks}`}
      </p>
    </StyledCourseClass>
  );
};

interface DroppedClassesProps {
  selectedCourses: CourseData[]
  selectedClassIds: string[]
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
    activity={classData.activity}
    courseCode={course.courseCode}
    color={assignedColors[course.courseCode]}
    classTime={classTime}
  />
);

const DroppedClasses: FunctionComponent<DroppedClassesProps> = ({
  selectedCourses,
  selectedClassIds,
  assignedColors,
}) => {
  const droppedClasses: JSX.Element[] = [];

  selectedCourses.forEach((course) => {
    const allClasses = Object.values(course.classes).flatMap((x) => x);
    allClasses.filter(
      (classData) => selectedClassIds.includes(classData.classId),
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
