import React from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import { Box, Button } from '@material-ui/core';
import { CourseData, ClassData } from '../../interfaces/CourseData';

import InventoryCourseClass from './InventoryCourseClass';

export interface InventoryRowProps {
  course: CourseData
  color: string
  selectedClasses: ClassData[]
  removeCourse(courseCode: string): void
  removeClass(classData: ClassData): void
}

const StyledInventoryRow = styled(Box)`
  display: flex;
  padding: 5px;
  border: 1px solid;
  border-color: ${(props) => props.theme.palette.secondary.main}
`;

const RowCourseDescriptor = styled(Box)`
  width: 100px;
  /* margin-top: 20px; */
  padding: 10px;
  border-right: 1px solid;
  border-color: ${(props) => props.theme.palette.secondary.main}
`;

const RowItems = styled.div<{ canDrop: boolean, color: string }>`
  /* ${(props) => props.canDrop && `border: 1px solid ${props.color}`} */
  width: 100%;
`;

const InventoryRow: React.FC<InventoryRowProps> = ({
  course,
  removeCourse,
  selectedClasses,
  color,
  removeClass,
}) => {
  const getInventoryCourseClasses = (): React.ReactNode[] => {
    // return course classes for activities which don't currently have a selected class
    const res = Object.entries(course.classes)
      .filter(
        ([_, activityClasses]) => (
          !activityClasses.some(
            (classData) => selectedClasses.includes(classData),
          )
        ),
      )
      .map(([activity]) => (
        <InventoryCourseClass
          key={`${course.courseCode}-${activity}`}
          courseCode={course.courseCode}
          activity={activity}
          color={color}
        />
      ));

    return res;
  };

  const ids = Object.keys(course.classes).map((activity) => `${course.courseCode}-${activity}`);

  const [{ canDrop }, drop] = useDrop({
    accept: ids,
    drop: ({ classData }: any) => removeClass(classData),
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  });

  return (
    <StyledInventoryRow>
      <RowCourseDescriptor>
        <Button
          onClick={() => {
            removeCourse(course.courseCode);
          }}
          color="secondary"
        >
          X
        </Button>
        {`${course.courseCode}`}
      </RowCourseDescriptor>
      <RowItems ref={drop} canDrop={canDrop} color={color}>
        {getInventoryCourseClasses()}
      </RowItems>
    </StyledInventoryRow>
  );
};

export default InventoryRow;
