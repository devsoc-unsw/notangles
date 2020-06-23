import React, { FunctionComponent } from 'react';
import { useDrag } from 'react-dnd';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import Alert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';

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

const DroppedClasses: FunctionComponent<DroppedClassesProps> = ({
  selectedCourses,
  selectedClasses,
  assignedColors,
}) => {
  const droppedClasses: JSX.Element[] = [];
  const hasClash = false;
  const clashes: string[] = [];
  selectedCourses.forEach((course) => {
    const allClasses = Object.values(course.classes).flatMap((x) => x);
    allClasses.filter(
      (classData) => selectedClasses.includes(classData),
    ).forEach((classData) => {
      classData.periods.forEach((classTime) => {
        // for (let i = 0; i < droppedClasses.length; i += 1) {
        //   if ((droppedClasses[i].props.classTime.time.day === classTime.time.day
        //           && parseInt(droppedClasses[i].props.classTime.time.start.slice(0, 2), 10)
        //           >= parseInt(classTime.time.start.slice(0, 2), 10)
        //           && parseInt(droppedClasses[i].props.classTime.time.start.slice(0, 2), 10)
        //           < parseInt(classTime.time.end.slice(0, 2), 10))
        //           || (droppedClasses[i].props.classTime.time.day === classTime.time.day
        //             && parseInt(classTime.time.start.slice(0, 2), 10)
        //             >= parseInt(droppedClasses[i].props.classTime.time.start.slice(0, 2), 10)
        //             && parseInt(classTime.time.start.slice(0, 2), 10)
        //             < parseInt(droppedClasses[i].props.classTime.time.end.slice(0, 2), 10))) {
        //     hasClash = true;
        //
        //     const newClash =
        //     `${classData.classI
        //       .split('-')
        //       .slice(0, -1).join(' ')} with ${droppedClasses[i].\
        //         props.courseCode} ${droppedClasses[i].props.activity}`;
        //     if (!clashes.includes(newClash)) {
        //       clashes.push(newClash);
        //     }
        //   }
        // }
        droppedClasses.push(
          <DroppedClass
            key={`${classData.classId}-${JSON.stringify(classTime)}`}
            classData={classData}
            classTime={classTime}
            color={assignedColors[course.courseCode]}
          />,
        );
      });
    });
  });

  return (
    <>
      {droppedClasses}
      {' '}
      <Snackbar open={hasClash} autoHideDuration={6000}>
        <Alert severity="warning">
          {`Clashes: ${clashes.join(', ')}`}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DroppedClasses;
