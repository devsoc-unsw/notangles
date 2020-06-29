import React from 'react';
import styled from 'styled-components';
import { useDrop } from 'react-dnd';
import { CourseData, ClassData } from '../../interfaces/CourseData';

import InventoryCourseClass from './InventoryCourseClass';

const StyledInventory = styled.div<{
  isVisible: boolean
}>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2px;
  grid-column: -2;
  grid-row: 2 / -1;
  position: relative;

  border: 1px solid ${(props) => props.theme.palette.secondary.main};
  background-color: ${(props) => props.theme.palette.secondary.light};
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  transition: opacity 0.2s;

  top: -1px;
  left: -${(props) => props.theme.shape.borderRadius}px;
  width: calc(100% + ${(props) => props.theme.shape.borderRadius}px);
  height: calc(100% + 1px);
  box-sizing: border-box;
  padding-left: ${(props) => props.theme.shape.borderRadius + 1}px;

  border-top-right-radius: ${(props) => props.theme.shape.borderRadius}px;
  border-bottom-right-radius: ${(props) => props.theme.shape.borderRadius}px;
`;

const StyledInventoryText = styled.div`
  color: #adadad;
  margin: 10px;
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
      )
      ) {
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

  const ids = selectedCourses.reduce<string[]>((array, course): string[] => (
    [...array, ...Object.keys(course.activities).map((activity) => (
      `${course.code}-${activity}`
    ))]
  ), []);

  const [{ canDrop }, drop] = useDrop({
    accept: ids,
    drop: ({ classData }: any) => classData && removeClass(classData),
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  });

  return (
    <StyledInventory ref={drop} isVisible={canDrop || classNodes.length > 0}>
      {classNodes}
      {(canDrop && classNodes.length === 0) && (
        <StyledInventoryText>
          Drag classes here which you want out of the way
        </StyledInventoryText>
      )}
    </StyledInventory>
  );
};

export default Inventory;
