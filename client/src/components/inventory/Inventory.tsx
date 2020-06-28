import React from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import { CourseData, ClassData } from '../../interfaces/CourseData';

import InventoryCourseClass from './InventoryCourseClass';

const StyledInventory = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2px;
  grid-column: -2;
  grid-row: 2 / -1;
`;

export interface InventoryProps {
  selectedCourses: CourseData[]
  selectedClasses: ClassData[]
  assignedColors: Record<string, string>
  removeClass(classData: ClassData): void
}

const Inventory: React.FC<InventoryProps> = ({
  selectedCourses,
  selectedClasses,
  assignedColors,
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
              color={assignedColors[course.code]}
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
    <StyledInventory ref={drop}>
      {getInventoryCourseClasses()}
    </StyledInventory>
  );
};

export default Inventory;
