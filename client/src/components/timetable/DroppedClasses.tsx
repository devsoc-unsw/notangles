import React, { FunctionComponent, useState } from 'react';
import { useDrag } from 'react-dnd';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import { timeToPosition } from './Dropzone';
import {
  CourseData, ClassPeriod, ClassData,
} from '../../interfaces/CourseData';

const getClassTranslateX = (classTime: ClassPeriod) => (
  (classTime.time.day - 1) * 100
)

const getClassTranslateY = (classTime: ClassPeriod) => {
  // height compared to standard row height
  const heightFactor = classTime.time.end - classTime.time.start;
  // number of rows to offset down
  const offsetRows = timeToPosition(classTime.time.start) - 2
  // calculate translate percentage (relative to height)
  return (offsetRows / heightFactor) * 100;
}

const classMargin = 2;

const StyledCourseClass = styled.div<{
  classTime: ClassPeriod
  isDragging: boolean
}>`
  grid-column: 2;
  grid-row: 2 / ${(props) => (
    timeToPosition(props.classTime.time.end) - timeToPosition(props.classTime.time.start) + 2
  )};
  transform: translate(
    ${(props) => getClassTranslateX(props.classTime)}%,
    ${(props) => getClassTranslateY(props.classTime)}%
  ) scale(${(props) => props.isDragging ? 1.2 : 1});

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
  shouldForwardProp: (prop) => !["backgroundColor"].includes(prop),
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

  height: 100%;
  box-sizing: border-box;
  padding: 10px;
  position: relative;

  p {
    margin: 0 0;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

interface DroppedClassProps {
  classData: ClassData
  classTime: ClassPeriod
  color: string
  setDragElement: (element: HTMLElement) => void
}

const DroppedClass: FunctionComponent<DroppedClassProps> = ({
  classData,
  classTime,
  color,
  setDragElement,
}) => {
  const {
    course,
    activity,
    enrolments,
    capacity,
  } = classData;

  // const [{ isDragging }, drag] = useDrag({
  //   item: {
  //     type: `${course.code}-${activity}`,
  //     classData,
  //   },
  //   collect: (monitor) => ({
  //     isDragging: monitor.isDragging(),
  //   }),
  // });

  const [isDragging, setIsDragging] = useState(false);

  const { weeks } = classTime.time;

  const isMultipleWeeks = (wks: string) => (
    wks.includes(',') || wks.includes('-')
  );

  const onDown = (event: any) => {
    setIsDragging(true);
    setDragElement(event.currentTarget);
  }

  const onUp = () => {
    setIsDragging(false);
  }

  return (
    <StyledCourseClass
      classTime={classTime}
      isDragging={isDragging}
      onMouseDown={onDown}
      onMouseUp={onUp}
      style={{left: 0, top: 0}}
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
          {`${classTime.locationShort} `}
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
  setDragElement: (element: HTMLElement) => void
}

const DroppedClasses: FunctionComponent<DroppedClassesProps> = ({
  selectedCourses,
  selectedClasses,
  assignedColors,
  setDragElement,
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
            setDragElement={setDragElement}
          />,
        );
      });
    });
  });

  return <>{droppedClasses}</>;
};

export default DroppedClasses;
