import React from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import { CourseData, ClassData } from '../../interfaces/CourseData';

import InventoryCourseClass from './InventoryCourseClass';

const StyledInventory = styled.div`
  display: flex;
  flex-direction: column;
  padding: 5px;
  grid-column: -2;
  grid-row: 1 / -1;
  position: relative;
  border: 1px solid ${(props) => props.theme.palette.secondary.main};
  background-color: ${(props) => props.theme.palette.secondary.light};
  transition: 0.2s;
  border-radius: ${(props) => props.theme.shape.borderRadius}px;
  box-sizing: border-box;
  width: calc(100% + 2px);
  left: -3px;
`;

const StyledInventoryText = styled.div`
  color: ${(props) => props.theme.palette.secondary.dark};
  transition: 0.2s;
  margin-left: 10px;
  margin-right: 10px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
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
  const classNodes: React.ReactNode[] = [];

  // return course classes for activities which don't currently have a selected class
  selectedCourses.forEach((course) => {
    Object.entries(course.activities).forEach(([activity, activityClasses]) => {
      if (!activityClasses.some(
        (classData) => selectedClasses.includes(classData),
      )) {
        classNodes.push(
          <InventoryCourseClass
            key={`${course.code}-${activity}`}
            courseCode={course.code}
            activity={activity}
            color={assignedColors[course.code]}
          />,
        );
      }
    });
  });

  // const ids = selectedCourses.reduce<string[]>((array, course) => (
  //   [...array, ...Object.keys(course.activities).map((activity) => (
  //     `${course.code}-${activity}`
  //   ))]
  // ), []);

  return (
    <StyledInventory>
      {classNodes}
      <StyledInventoryText>
        Drag classes here to get them out of the way
      </StyledInventoryText>
    </StyledInventory>
  );
};

export default Inventory;
