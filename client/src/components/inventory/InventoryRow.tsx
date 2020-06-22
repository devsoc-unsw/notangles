import React from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import { Box, Button } from '@material-ui/core';
import { CourseData, ClassData } from '../../interfaces/CourseData';

import InventoryCourseClass from './InventoryCourseClass';

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

export interface InventoryRowProps {
  selectedCourses: CourseData[]
  selectedClasses: ClassData[]
  removeClass(classData: ClassData): void
}

const InventoryRow: React.FC<InventoryRowProps> = ({
  selectedCourses,
  selectedClasses,
  removeClass,
}) => {
  const getInventoryCourseClasses = (): React.ReactNode[] => {
    let classNodes: React.ReactNode[] = []

    // return course classes for activities which don't currently have a selected class
    selectedCourses.forEach((course) => {
      Object.entries(course.activities).forEach(([activity, activityClasses]) => {
        if (!activityClasses.some(
            (classData) => selectedClasses.includes(classData),
          )
        ) {
          classNodes.push(
            <InventoryCourseClass
              key={`${course.code}-${activity}`}
              courseCode={course.code}
              activity={activity}
              color={"grey"}
            />
          )
        }
      })
    })

    return classNodes;
  };

  const ids = selectedCourses.reduce<string[]>((array, course): string[] => (
    [...array, ...Object.keys(course.activities).map((activity) => (
      `${course.code}-${activity}`
    ))]
  ), []);

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
          color="secondary"
        >
          X
        </Button>
        All
      </RowCourseDescriptor>
      <RowItems ref={drop} canDrop={canDrop} color={"grey"}>
        {getInventoryCourseClasses()}
      </RowItems>
    </StyledInventoryRow>
  );
};

export default InventoryRow;
